import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Generate CSV files for bulk import into Schoology
 * Supports users (teachers), courses, and enrollments
 * Can combine data from multiple seed files (all three students)
 * 
 * CRITICAL: All school_uid values are read from seed JSON files, NOT dynamically generated
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();
    
    // Check admin role
    const roleDoc = await db.collection('app_roles').doc(userId).get();
    const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) ? (roleDoc.data() as any).roles : [];
    if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const type = request.nextUrl.searchParams.get('type') || 'courses'; // users, courses, enrollments

    // Read ALL seed JSON files
    const pathMod = await import('path');
    const fs = await import('fs/promises');
    const seedDir = pathMod.join(process.cwd(), 'seed', 'sandbox');
    const seedFiles = ['carter-mock.json', 'tazio-mock.json', 'livio-mock.json'];
    
    const allSeeds = [];
    for (const seedFile of seedFiles) {
      try {
        const seedFilePath = pathMod.join(seedDir, seedFile);
        const fileText = await fs.readFile(seedFilePath, 'utf-8');
        allSeeds.push({ name: seedFile.replace('.json', ''), data: JSON.parse(fileText) });
      } catch (err) {
        console.warn(`[csv] Could not read ${seedFile}:`, err);
      }
    }

    if (allSeeds.length === 0) {
      return NextResponse.json({ error: 'No seed files found' }, { status: 404 });
    }

    let csv = '';
    let filename = '';

    if (type === 'users') {
      // CSV format for teachers: school_uid,name_title,name_first,name_last,primary_email,role_name
      csv = 'school_uid,name_title,name_first,name_last,primary_email,role_name\n';
      
      const teacherSet = new Set<string>(); // Deduplicate teachers
      
      for (const seed of allSeeds) {
        for (const teacher of seed.data.users?.teachers || []) {
          // Skip invalid teacher names (e.g., "—", empty, or non-alphanumeric)
          if (!teacher.name || !teacher.name.trim() || !/[a-zA-Z]/.test(teacher.name)) continue;
          
          // CRITICAL: Use school_uid from JSON (NEVER generate dynamically)
          const schoolUid = teacher.school_uid;
          if (!schoolUid) {
            console.warn(`[csv] Teacher "${teacher.name}" missing school_uid, skipping`);
            continue;
          }
          
          if (teacherSet.has(schoolUid)) continue; // Skip duplicates
          teacherSet.add(schoolUid);
          
          const fullName = teacher.name || 'Teacher';
          const parts = fullName.split(' ').filter(Boolean);
          const firstName = parts[0] || 'Teacher';
          const lastName = parts.slice(1).join(' ') || 'User';
          
          // Generate email: firstname.lastname@modernteaching.example
          const emailSafe = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const email = teacher.email || `${emailSafe(firstName)}.${emailSafe(lastName)}@modernteaching.example`;
          
          csv += `${schoolUid},,${firstName},${lastName},${email},Teacher\n`;
        }
      }
      
      filename = `all-teachers.csv`;
      
    } else if (type === 'courses') {
      // Schoology Course Import Notes:
      // - Courses and Sections are imported together in ONE CSV file
      // - School and Grading Period(s) are selected during the import UI, not in the CSV
      // - Existing courses (matched by course_code) will be reused if found
      // - Section codes MUST be unique across courses and grading periods
      // - Required fields: Course Name*, Course Code*, Section Name*, Section School Code**/Section Code**
      csv = 'course_code,course_title,section_title,section_school_code,description,department,credits\n';
      
      const sectionSet = new Set<string>(); // Deduplicate sections
      
      for (const seed of allSeeds) {
        for (const course of seed.data.courses || []) {
          const title = course.title || '';
          
          // Use explicit course_code from JSON, or generate from title
          const codeBase = course.course_code || course.title?.toString().replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 20) || 'COURSE';
          
          // Use explicit section and section_school_code from JSON
          const sectionTitle = course.section || 'S1';
          const sectionCode = course.section_school_code || `${codeBase}-${sectionTitle}`;
          
          const description = course.description || '';
          const department = course.department || '';
          const credits = course.credits || '1';
          
          if (sectionSet.has(sectionCode)) continue; // Skip duplicates
          sectionSet.add(sectionCode);
          
          const escapeCsv = (str: string) => {
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          };
          
          csv += `${escapeCsv(codeBase)},${escapeCsv(title)},${escapeCsv(sectionTitle)},${escapeCsv(sectionCode)},${escapeCsv(description)},${escapeCsv(department)},${credits}\n`;
        }
      }
      
      filename = `all-courses.csv`;
      
    } else if (type === 'enrollments') {
      // CSV format: course_code,section_school_code,unique_user_id,enrollment_type
      // Note: enrollment_type values per PowerSchool docs: 1 = Admin (teachers), 2 = Member (students)
      csv = 'course_code,section_school_code,unique_user_id,enrollment_type\n';
      
      const teacherEnrollmentSet = new Set<string>();
      
      for (const seed of allSeeds) {
        // Enroll teachers in their sections FIRST (deduplicate)
        for (const course of seed.data.courses || []) {
          // Skip courses without valid teachers
          if (!course.teacher || !course.teacher.trim() || !/[a-zA-Z]/.test(course.teacher)) continue;
          
          // Use explicit course_code and section_school_code from JSON
          const codeBase = course.course_code || course.title?.toString().replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 20) || 'COURSE';
          const sectionCode = course.section_school_code || `${codeBase}-S1`;
          
          // Look up teacher's school_uid from the teachers array
          const teacherName = course.teacher;
          const teacherObj = seed.data.users?.teachers?.find((t: any) => t.name === teacherName);
          const teacherUid = teacherObj?.school_uid;
          
          if (!teacherUid) {
            console.warn(`[csv] Teacher "${teacherName}" not found in teachers array or missing school_uid, skipping enrollment`);
            continue;
          }
          
          const enrollmentKey = `${sectionCode}|${teacherUid}`;
          if (teacherEnrollmentSet.has(enrollmentKey)) continue;
          teacherEnrollmentSet.add(enrollmentKey);
          
          csv += `${codeBase},${sectionCode},${teacherUid},1\n`;
        }
        
        // Then enroll students in their sections
        for (const enrollment of seed.data.enrollments || []) {
          const course = seed.data.courses?.find((c: any) => c.title === enrollment.course);
          if (!course) continue;
          
          // Use explicit course_code and section_school_code from JSON
          const codeBase = course.course_code || course.title?.toString().replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '').toUpperCase().slice(0, 20) || 'COURSE';
          const sectionCode = course.section_school_code || `${codeBase}-S1`;
          
          // CRITICAL: Use school_uid from JSON (NEVER generate dynamically)
          const studentUid = seed.data.users.student.school_uid;
          if (!studentUid) {
            console.warn(`[csv] Student "${seed.data.users.student.name}" missing school_uid, skipping enrollment`);
            continue;
          }
          
          csv += `${codeBase},${sectionCode},${studentUid},2\n`;
        }
      }
      
      filename = `all-enrollments.csv`;
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[admin/seed/csv] Error:', error);
    return NextResponse.json({ error: 'CSV generation failed', details: String(error) }, { status: 500 });
  }
}