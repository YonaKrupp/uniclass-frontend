import { getApiBase } from '../../shared/apiBase.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, teacherEmail, token, ...params } = body;

    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const API_BASE = getApiBase(req);
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url, method, reqBody;

    switch (action) {
      case 'get':
        url = `${API_BASE}/api/WeekSlots?teacherEmail=${encodeURIComponent(teacherEmail)}&firstDayOfWeek=${params.firstDayOfWeek}`;
        method = 'GET';
        break;

      case 'getStudent':
        url = `${API_BASE}/api/WeekSlots/student?teacherEmail=${encodeURIComponent(teacherEmail)}&studentEmail=${encodeURIComponent(params.studentEmail)}&firstDayOfWeek=${params.firstDayOfWeek}&subjectId=${encodeURIComponent(params.subjectId)}`;
        method = 'GET';
        break;

      case 'markAvailable':
        url = `${API_BASE}/api/WeekSlots/TeacherSelectUnselectSlot`;
        method = 'PUT';
        reqBody = {
          teacherEmail,
          slotDate_yyyyMMdd: params.slotDate,
          startHours: params.startHours,
          slotState_1free_2occupied: 1,
          sgn06_CssClass: params.cssClass,
        };
        break;

      case 'studentSelectUnselect':
        url = `${API_BASE}/api/WeekSlots/StudentSelectUnselectSlot`;
        method = 'PUT';
        reqBody = {
          studentEmail: params.studentEmail,
          teacherEmail,
          slotDate_yyyyMMdd: params.slotDate,
          startHoures: params.startHoures,
          sgn06_CssClass: params.cssClass,
          selectedSubjectAndLevel: params.subjectId,
        };
        break;

      case 'cancelLesson':
        url = `${API_BASE}/api/WeekSlots/CancelStudentLessonFromTeacherSlot`;
        method = 'PUT';
        reqBody = {
          gn06_id: params.gn06Id,
          teacherEmail,
          studentRegisteredEmail: params.studentEmail,
          slotDate_yyyyMMdd: params.slotDate,
          startHours: params.startHours,
          sgn06_CssClass: params.cssClass,
        };
        break;

      case 'joinWaitingList':
        url = `${API_BASE}/api/WeekSlots/set_student_to_course_waiting_list`;
        method = 'POST';
        reqBody = {
          studentEmail: params.studentEmail,
          courseId: params.courseId,
        };
        break;

      case 'backToSchedule':
        url = `${API_BASE}/api/WeekSlots/set_back_to_student_schedule`;
        method = 'POST';
        reqBody = {
          studentEmail: params.studentEmail,
          isTimerExpiredCancel: params.isTimerExpiredCancel ?? 0,
        };
        break;

      case 'moveLesson':
        url = `${API_BASE}/api/WeekSlots/MoveStudentLessonFromTeacherSlot`;
        method = 'PUT';
        reqBody = {
          gn06_id: params.gn06Id,
          teacherEmail,
          studentRegisteredEmail: params.studentEmail,
          slotDate_yyyyMMdd: params.slotDate,
          startHours: params.startHours,
          sgn06_CssClass: params.cssClass,
          step_1pick_2newslot: params.step,
        };
        break;

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const fetchOptions = { method, headers };
    if (reqBody) fetchOptions.body = JSON.stringify(reqBody);

    const apiRes = await fetch(url, fetchOptions);

    const buffer = await apiRes.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buffer);
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return Response.json({ ...data, _status: apiRes.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});