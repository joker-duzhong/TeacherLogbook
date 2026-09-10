export interface paths {
    "/api/v1/auth/sms/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["send_sms_api_v1_auth_sms_send_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/phone/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["phone_login_api_v1_auth_phone_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/phone/bind": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["phone_bind_api_v1_auth_phone_bind_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/miniapp/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["miniapp_login_api_v1_auth_miniapp_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refresh_token_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_me_api_v1_auth_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_scan_apps_api_v1_auth_scan_apps_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create_scan_session_api_v1_auth_scan_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/sessions/{transaction_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["poll_scan_session_api_v1_auth_scan_sessions__transaction_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/exchange": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["exchange_scan_api_v1_auth_scan_exchange_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_classes_api_v1_teacher_logbook_classes_get"];
        put?: never;
        post: operations["create_class_api_v1_teacher_logbook_classes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_students_api_v1_teacher_logbook_classes__class_id__students_get"];
        put?: never;
        post: operations["create_student_api_v1_teacher_logbook_classes__class_id__students_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students/{student_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_student_api_v1_teacher_logbook_classes__class_id__students__student_id__get"];
        put?: never;
        post: operations["update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__post"];
        delete: operations["delete_student_api_v1_teacher_logbook_classes__class_id__students__student_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update_class_api_v1_teacher_logbook_classes__class_id__post"];
        delete: operations["delete_class_api_v1_teacher_logbook_classes__class_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_class_api_v1_teacher_logbook_classes__class_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["export_students_api_v1_teacher_logbook_classes__class_id__students_export_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["import_students_api_v1_teacher_logbook_classes__class_id__students_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/seat-board": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_seat_board_api_v1_teacher_logbook_classes__class_id__seat_board_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/seat-board/layout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["update_seat_layout_api_v1_teacher_logbook_classes__class_id__seat_board_layout_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/seat-board/assignments/{student_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["move_student_api_v1_teacher_logbook_classes__class_id__seat_board_assignments__student_id__put"];
        post?: never;
        delete: operations["remove_student_seat_api_v1_teacher_logbook_classes__class_id__seat_board_assignments__student_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/seat-board/assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["batch_seats_api_v1_teacher_logbook_classes__class_id__seat_board_assignments_put"];
        post?: never;
        delete: operations["clear_seats_api_v1_teacher_logbook_classes__class_id__seat_board_assignments_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["dashboard_api_v1_teacher_logbook_classes__class_id__dashboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/finance-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["finance_summary_api_v1_teacher_logbook_classes__class_id__finance_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/training-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["training_summary_api_v1_teacher_logbook_classes__class_id__training_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/alerts/{item_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update_alert_status_api_v1_teacher_logbook_classes__class_id__alerts__item_id__status_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["update_alert_status_api_v1_teacher_logbook_classes__class_id__alerts__item_id__status_patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/todos/{item_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update_todo_status_api_v1_teacher_logbook_classes__class_id__todos__item_id__status_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["update_todo_status_api_v1_teacher_logbook_classes__class_id__todos__item_id__status_patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/users/me/preferences/ui": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_get"];
        put?: never;
        post: operations["update_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["update_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/backup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["export_backup_api_v1_teacher_logbook_classes__class_id__backup_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/backup/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["validate_backup_api_v1_teacher_logbook_classes__class_id__backup_validate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/backup/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["restore_backup_api_v1_teacher_logbook_classes__class_id__backup_restore_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/data/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["clear_class_data_api_v1_teacher_logbook_classes__class_id__data_clear_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/legacy-import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["import_legacy_data_api_v1_teacher_logbook_classes__class_id__legacy_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/leave-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests_get"];
        put?: never;
        post: operations["create_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/leave-requests/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__get"];
        put?: never;
        post: operations["update_compatible_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__post"];
        delete: operations["delete_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/homework-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records_get"];
        put?: never;
        post: operations["create_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/homework-records/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__get"];
        put?: never;
        post: operations["update_compatible_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__post"];
        delete: operations["delete_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/violations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_violations_api_v1_teacher_logbook_classes__class_id__violations_get"];
        put?: never;
        post: operations["create_violations_api_v1_teacher_logbook_classes__class_id__violations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/violations/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__get"];
        put?: never;
        post: operations["update_compatible_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__post"];
        delete: operations["delete_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_alerts_api_v1_teacher_logbook_classes__class_id__alerts_get"];
        put?: never;
        post: operations["create_alerts_api_v1_teacher_logbook_classes__class_id__alerts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/alerts/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__get"];
        put?: never;
        post: operations["update_compatible_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__post"];
        delete: operations["delete_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/todos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_todos_api_v1_teacher_logbook_classes__class_id__todos_get"];
        put?: never;
        post: operations["create_todos_api_v1_teacher_logbook_classes__class_id__todos_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/todos/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__get"];
        put?: never;
        post: operations["update_compatible_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__post"];
        delete: operations["delete_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/work-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_work_records_api_v1_teacher_logbook_classes__class_id__work_records_get"];
        put?: never;
        post: operations["create_work_records_api_v1_teacher_logbook_classes__class_id__work_records_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/work-records/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__get"];
        put?: never;
        post: operations["update_compatible_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__post"];
        delete: operations["delete_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/exams": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_exams_api_v1_teacher_logbook_classes__class_id__exams_get"];
        put?: never;
        post: operations["create_exams_api_v1_teacher_logbook_classes__class_id__exams_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/exams/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__get"];
        put?: never;
        post: operations["update_compatible_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__post"];
        delete: operations["delete_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/committee-roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles_get"];
        put?: never;
        post: operations["create_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/committee-roles/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__get"];
        put?: never;
        post: operations["update_compatible_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__post"];
        delete: operations["delete_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/committee-members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members_get"];
        put?: never;
        post: operations["create_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/committee-members/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__get"];
        put?: never;
        post: operations["update_compatible_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__post"];
        delete: operations["delete_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/hygiene-assignments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments_get"];
        put?: never;
        post: operations["create_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/hygiene-assignments/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__get"];
        put?: never;
        post: operations["update_compatible_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__post"];
        delete: operations["delete_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_activities_api_v1_teacher_logbook_classes__class_id__activities_get"];
        put?: never;
        post: operations["create_activities_api_v1_teacher_logbook_classes__class_id__activities_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/activities/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__get"];
        put?: never;
        post: operations["update_compatible_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__post"];
        delete: operations["delete_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/finance-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records_get"];
        put?: never;
        post: operations["create_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/finance-records/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__get"];
        put?: never;
        post: operations["update_compatible_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__post"];
        delete: operations["delete_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/awards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_awards_api_v1_teacher_logbook_classes__class_id__awards_get"];
        put?: never;
        post: operations["create_awards_api_v1_teacher_logbook_classes__class_id__awards_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/awards/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__get"];
        put?: never;
        post: operations["update_compatible_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__post"];
        delete: operations["delete_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/courses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_courses_api_v1_teacher_logbook_classes__class_id__courses_get"];
        put?: never;
        post: operations["create_courses_api_v1_teacher_logbook_classes__class_id__courses_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/courses/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__get"];
        put?: never;
        post: operations["update_compatible_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__post"];
        delete: operations["delete_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/talks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_talks_api_v1_teacher_logbook_classes__class_id__talks_get"];
        put?: never;
        post: operations["create_talks_api_v1_teacher_logbook_classes__class_id__talks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/talks/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__get"];
        put?: never;
        post: operations["update_compatible_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__post"];
        delete: operations["delete_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_contacts_api_v1_teacher_logbook_classes__class_id__contacts_get"];
        put?: never;
        post: operations["create_contacts_api_v1_teacher_logbook_classes__class_id__contacts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/contacts/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__get"];
        put?: never;
        post: operations["update_compatible_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__post"];
        delete: operations["delete_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/training-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_training_records_api_v1_teacher_logbook_classes__class_id__training_records_get"];
        put?: never;
        post: operations["create_training_records_api_v1_teacher_logbook_classes__class_id__training_records_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/training-records/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__get"];
        put?: never;
        post: operations["update_compatible_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__post"];
        delete: operations["delete_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__patch"];
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/links": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_links_api_v1_teacher_logbook_classes__class_id__links_get"];
        put?: never;
        post: operations["create_links_api_v1_teacher_logbook_classes__class_id__links_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/links/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_links_api_v1_teacher_logbook_classes__class_id__links__item_id__get"];
        put?: never;
        post: operations["update_compatible_links_api_v1_teacher_logbook_classes__class_id__links__item_id__post"];
        delete: operations["delete_links_api_v1_teacher_logbook_classes__class_id__links__item_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_links_api_v1_teacher_logbook_classes__class_id__links__item_id__patch"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        SendSmsRequest: {
            phone: string;
        };
        ResponseModel: {
            code: number;
            message: string;
            data?: unknown | null;
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
        PhoneLoginRequest: {
            phone: string;
            code: string;
        };
        ResponseModel_LoginResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["LoginResponse"] | null;
        };
        LoginResponse: {
            access_token: string;
            refresh_token: string;
            token_type: string;
            user: components["schemas"]["UserResponse"];
        };
        UserResponse: {
            nickname?: string | null;
            avatar?: components["schemas"]["UserAvatarResponse"] | null;
            id: string;
            openid?: string | null;
            username?: string | null;
            email?: string | null;
            phone?: string | null;
            source: string | null;
            is_active: boolean | null;
            is_superuser: boolean | null;
            roles: components["schemas"]["RoleInfo"][];
            created_at?: string | null;
            updated_at?: string | null;
            readonly needs_phone_binding: boolean;
        };
        UserAvatarResponse: {
            id?: string | null;
            name?: string | null;
            url: string;
            thumb_url?: string | null;
            size?: number | null;
            type?: string | null;
            scope?: string | null;
            hash?: string | null;
            owner?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
        };
        RoleInfo: {
            id: string;
            name: string;
            code: string;
        };
        BindPhoneRequest: {
            phone: string;
            code: string;
        };
        ResponseModel_UserResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["UserResponse"] | null;
        };
        MiniappLoginRequest: {
            appid: string;
            code: string;
        };
        RefreshRequest: {
            refresh_token: string;
        };
        ResponseModel_Token_: {
            code: number;
            message: string;
            data?: components["schemas"]["Token"] | null;
        };
        Token: {
            access_token: string;
            refresh_token: string;
            token_type: string;
        };
        ResponseModel_list_ScanAppResponse__: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanAppResponse"][] | null;
        };
        ScanAppResponse: {
            app_key: string;
            name: string;
        };
        ScanCreateRequest: {
            app_key: string;
        };
        ResponseModel_ScanCreateResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanCreateResponse"] | null;
        };
        ScanCreateResponse: {
            transaction_id: string;
            status: components["schemas"]["ScanStatus"];
            app?: components["schemas"]["ScanAppResponse"] | null;
            expires_at?: string | null;
            poll_token: string;
            poll_interval_seconds: number;
        };
        ScanStatus: "WAITING_SCAN" | "PENDING" | "CONFIRMED" | "CONSUMED" | "CANCELLED" | "EXPIRED";
        ResponseModel_ScanPollResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanPollResponse"] | null;
        };
        ScanPollResponse: {
            transaction_id: string;
            status: components["schemas"]["ScanStatus"];
            app?: components["schemas"]["ScanAppResponse"] | null;
            expires_at?: string | null;
            exchange_code?: string | null;
        };
        ScanExchangeRequest: {
            transaction_id: string;
            exchange_code: string;
        };
        ResponseModel_list_ClassRead__: {
            code: number;
            message: string;
            data?: components["schemas"]["ClassRead"][] | null;
        };
        ClassRead: {
            name: string;
            timezone: string;
            id: string;
            createdAt: string;
            updatedAt: string;
        };
        ClassCreate: {
            name: string;
            timezone: string;
        };
        ResponseModel_ClassRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ClassRead"] | null;
        };
        PaginatedResponse_StudentRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_StudentRead_"] | null;
        };
        PaginatedData_StudentRead_: {
            items: components["schemas"]["StudentRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        StudentRead: {
            name: string;
            gender: "男" | "女" | "其他";
            contact?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        StudentCreate: {
            name: string;
            gender: "男" | "女" | "其他";
            contact?: string | null;
        };
        ResponseModel_StudentRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["StudentRead"] | null;
        };
        StudentUpdate: {
            name?: string | null;
            gender?: ("男" | "女" | "其他") | null;
            contact?: string | null;
        };
        ClassUpdate: {
            name?: string | null;
            timezone?: string | null;
        };
        Body_import_students_api_v1_teacher_logbook_classes__class_id__students_import_post: {
            file: string;
            dryRun: boolean;
            duplicateStrategy: string;
        };
        ResponseModel_ImportResult_: {
            code: number;
            message: string;
            data?: components["schemas"]["ImportResult"] | null;
        };
        ImportResult: {
            totalRows: number;
            created: number;
            skipped: number;
            failed: number;
            errors: {
                [key: string]: unknown;
            }[];
        };
        ResponseModel_SeatBoardResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["SeatBoardResponse"] | null;
        };
        SeatBoardResponse: {
            layout: components["schemas"]["SeatLayout"];
            assignments: components["schemas"]["SeatItem"][];
            version: number;
            updatedAt: string;
        };
        SeatLayout: {
            rows: number;
            columnGroups: number[];
            columns: number;
        };
        SeatItem: {
            studentId: string;
            studentName?: string | null;
            row: number;
            column: number;
        };
        LayoutUpdate: {
            rows: number;
            columnGroups: number[];
        };
        ResponseModel_SeatLayoutResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["SeatLayoutResponse"] | null;
        };
        SeatLayoutResponse: {
            layout: components["schemas"]["SeatLayout"];
            removedStudentIds: string[];
            version: number;
        };
        SeatMove: {
            row: number;
            column: number;
            swap: boolean;
        };
        SeatBatch: {
            mode: "replace" | "merge";
            assignments?: components["schemas"]["SeatItem"][];
        };
        ResponseModel_DashboardRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["DashboardRead"] | null;
        };
        DashboardRead: {
            studentSummary: components["schemas"]["StudentSummary"];
            leaveToday: number;
            unsubmittedHomework: number;
            violationCount: number;
            workRecordsThisMonth: number;
            pendingTodoCount: number;
            alertSummary: components["schemas"]["AlertSummary"];
            highRiskStudents: components["schemas"]["AlertsRead"][];
            upcomingTodos: components["schemas"]["TodosRead"][];
            latestExam?: components["schemas"]["ExamsRead"] | null;
            recentWorkRecords: components["schemas"]["WorkRecordsRead"][];
        };
        StudentSummary: {
            total: number;
            male: number;
            female: number;
        };
        AlertSummary: {
            emotion: number;
            specialHealth: number;
            dropoutRisk: number;
            notReturned: number;
            pending: number;
        };
        AlertsRead: {
            studentId: string;
            type: "情绪预警" | "特殊体质" | "辍学风险" | "未返校" | "其他";
            level: "高" | "中" | "低";
            status: "待处理" | "跟进中" | "已关闭";
            note?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        TodosRead: {
            title: string;
            due?: string | null;
            status: "待完成" | "已完成";
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        ExamsRead: {
            subject: string;
            name: string;
            average: string;
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        WorkRecordsRead: {
            title: string;
            date: string;
            note?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        ResponseModel_FinanceSummary_: {
            code: number;
            message: string;
            data?: components["schemas"]["FinanceSummary"] | null;
        };
        FinanceSummary: {
            income: string;
            expense: string;
            balance: string;
        };
        ResponseModel_TrainingSummary_: {
            code: number;
            message: string;
            data?: components["schemas"]["TrainingSummary"] | null;
        };
        TrainingSummary: {
            totalHours: string;
            categories: {
                [key: string]: {
                    [key: string]: number | string;
                };
            };
        };
        StatusUpdate: {
            status: string;
            note?: string | null;
        };
        ResponseModel_UiPreferenceRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["UiPreferenceRead"] | null;
        };
        UiPreferenceRead: {
            skin: string;
        };
        UiPreferenceUpdate: {
            skin: string;
        };
        Body_validate_backup_api_v1_teacher_logbook_classes__class_id__backup_validate_post: {
            file: string;
        };
        ResponseModel_BackupValidation_: {
            code: number;
            message: string;
            data?: components["schemas"]["BackupValidation"] | null;
        };
        BackupValidation: {
            valid: boolean;
            resourceCounts: {
                [key: string]: number;
            };
        };
        Body_restore_backup_api_v1_teacher_logbook_classes__class_id__backup_restore_post: {
            file: string;
            mode: string;
            confirmation: string;
        };
        ClearDataRequest: {
            confirmation: "CLEAR_CLASS_DATA";
        };
        Body_import_legacy_data_api_v1_teacher_logbook_classes__class_id__legacy_import_post: {
            file: string;
            dryRun: boolean;
            confirmation: string;
        };
        PaginatedResponse_LeaveRequestsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_LeaveRequestsRead_"] | null;
        };
        PaginatedData_LeaveRequestsRead_: {
            items: components["schemas"]["LeaveRequestsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        LeaveRequestsRead: {
            studentId: string;
            reason: "病假" | "事假" | "其他";
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        LeaveRequestData: {
            studentId: string;
            reason: "病假" | "事假" | "其他";
            date: string;
        };
        ResponseModel_LeaveRequestsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["LeaveRequestsRead"] | null;
        };
        LeaveRequestDataUpdate: {
            studentId?: string | null;
            reason?: ("病假" | "事假" | "其他") | null;
            date?: string | null;
        };
        PaginatedResponse_HomeworkRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_HomeworkRecordsRead_"] | null;
        };
        PaginatedData_HomeworkRecordsRead_: {
            items: components["schemas"]["HomeworkRecordsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        HomeworkRecordsRead: {
            subject: string;
            title: string;
            unsubmitted: number;
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        HomeworkRecordData: {
            subject: string;
            title: string;
            unsubmitted: number;
            date: string;
        };
        ResponseModel_HomeworkRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["HomeworkRecordsRead"] | null;
        };
        HomeworkRecordDataUpdate: {
            subject?: string | null;
            title?: string | null;
            unsubmitted?: number | null;
            date?: string | null;
        };
        PaginatedResponse_ViolationsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_ViolationsRead_"] | null;
        };
        PaginatedData_ViolationsRead_: {
            items: components["schemas"]["ViolationsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        ViolationsRead: {
            studentId: string;
            type: string;
            date: string;
            note?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        ViolationData: {
            studentId: string;
            type: string;
            date: string;
            note?: string | null;
        };
        ResponseModel_ViolationsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ViolationsRead"] | null;
        };
        ViolationDataUpdate: {
            studentId?: string | null;
            type?: string | null;
            date?: string | null;
            note?: string | null;
        };
        PaginatedResponse_AlertsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_AlertsRead_"] | null;
        };
        PaginatedData_AlertsRead_: {
            items: components["schemas"]["AlertsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        AlertData: {
            studentId: string;
            type: "情绪预警" | "特殊体质" | "辍学风险" | "未返校" | "其他";
            level: "高" | "中" | "低";
            status: "待处理" | "跟进中" | "已关闭";
            note?: string | null;
        };
        ResponseModel_AlertsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["AlertsRead"] | null;
        };
        AlertDataUpdate: {
            studentId?: string | null;
            type?: ("情绪预警" | "特殊体质" | "辍学风险" | "未返校" | "其他") | null;
            level?: ("高" | "中" | "低") | null;
            status?: ("待处理" | "跟进中" | "已关闭") | null;
            note?: string | null;
        };
        PaginatedResponse_TodosRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_TodosRead_"] | null;
        };
        PaginatedData_TodosRead_: {
            items: components["schemas"]["TodosRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        TodoData: {
            title: string;
            due?: string | null;
            status: "待完成" | "已完成";
        };
        ResponseModel_TodosRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["TodosRead"] | null;
        };
        TodoDataUpdate: {
            title?: string | null;
            due?: string | null;
            status?: ("待完成" | "已完成") | null;
        };
        PaginatedResponse_WorkRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_WorkRecordsRead_"] | null;
        };
        PaginatedData_WorkRecordsRead_: {
            items: components["schemas"]["WorkRecordsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        DatedNoteData: {
            title: string;
            date: string;
            note?: string | null;
        };
        ResponseModel_WorkRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["WorkRecordsRead"] | null;
        };
        DatedNoteDataUpdate: {
            title?: string | null;
            date?: string | null;
            note?: string | null;
        };
        PaginatedResponse_ExamsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_ExamsRead_"] | null;
        };
        PaginatedData_ExamsRead_: {
            items: components["schemas"]["ExamsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        ExamData: {
            subject: string;
            name: string;
            average: number | string;
            date: string;
        };
        ResponseModel_ExamsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ExamsRead"] | null;
        };
        ExamDataUpdate: {
            subject?: string | null;
            name?: string | null;
            average?: number | string | null;
            date?: string | null;
        };
        PaginatedResponse_CommitteeRolesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_CommitteeRolesRead_"] | null;
        };
        PaginatedData_CommitteeRolesRead_: {
            items: components["schemas"]["CommitteeRolesRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        CommitteeRolesRead: {
            role: string;
            duty: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        CommitteeRoleData: {
            role: string;
            duty: string;
        };
        ResponseModel_CommitteeRolesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["CommitteeRolesRead"] | null;
        };
        CommitteeRoleDataUpdate: {
            role?: string | null;
            duty?: string | null;
        };
        PaginatedResponse_CommitteeMembersRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_CommitteeMembersRead_"] | null;
        };
        PaginatedData_CommitteeMembersRead_: {
            items: components["schemas"]["CommitteeMembersRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        CommitteeMembersRead: {
            studentId: string;
            roleId: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        CommitteeMemberData: {
            studentId: string;
            roleId: string;
        };
        ResponseModel_CommitteeMembersRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["CommitteeMembersRead"] | null;
        };
        CommitteeMemberDataUpdate: {
            studentId?: string | null;
            roleId?: string | null;
        };
        PaginatedResponse_HygieneAssignmentsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_HygieneAssignmentsRead_"] | null;
        };
        PaginatedData_HygieneAssignmentsRead_: {
            items: components["schemas"]["HygieneAssignmentsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        HygieneAssignmentsRead: {
            studentId: string;
            area: string;
            day: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        HygieneAssignmentData: {
            studentId: string;
            area: string;
            day: string;
        };
        ResponseModel_HygieneAssignmentsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["HygieneAssignmentsRead"] | null;
        };
        HygieneAssignmentDataUpdate: {
            studentId?: string | null;
            area?: string | null;
            day?: string | null;
        };
        PaginatedResponse_ActivitiesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_ActivitiesRead_"] | null;
        };
        PaginatedData_ActivitiesRead_: {
            items: components["schemas"]["ActivitiesRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        ActivitiesRead: {
            title: string;
            date: string;
            note?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        ResponseModel_ActivitiesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ActivitiesRead"] | null;
        };
        PaginatedResponse_FinanceRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_FinanceRecordsRead_"] | null;
        };
        PaginatedData_FinanceRecordsRead_: {
            items: components["schemas"]["FinanceRecordsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        FinanceRecordsRead: {
            type: "收入" | "支出";
            amount: string;
            note: string;
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        FinanceRecordData: {
            type: "收入" | "支出";
            amount: number | string;
            note: string;
            date: string;
        };
        ResponseModel_FinanceRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["FinanceRecordsRead"] | null;
        };
        FinanceRecordDataUpdate: {
            type?: ("收入" | "支出") | null;
            amount?: number | string | null;
            note?: string | null;
            date?: string | null;
        };
        PaginatedResponse_AwardsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_AwardsRead_"] | null;
        };
        PaginatedData_AwardsRead_: {
            items: components["schemas"]["AwardsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        AwardsRead: {
            studentId: string;
            type: "表扬" | "奖励" | "批评" | "处分";
            note: string;
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        AwardData: {
            studentId: string;
            type: "表扬" | "奖励" | "批评" | "处分";
            note: string;
            date: string;
        };
        ResponseModel_AwardsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["AwardsRead"] | null;
        };
        AwardDataUpdate: {
            studentId?: string | null;
            type?: ("表扬" | "奖励" | "批评" | "处分") | null;
            note?: string | null;
            date?: string | null;
        };
        PaginatedResponse_CoursesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_CoursesRead_"] | null;
        };
        PaginatedData_CoursesRead_: {
            items: components["schemas"]["CoursesRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        CoursesRead: {
            course: string;
            teacher: string;
            day: "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日";
            startTime: string;
            endTime: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        CourseData: {
            course: string;
            teacher: string;
            day: "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日";
            startTime: string;
            endTime: string;
        };
        ResponseModel_CoursesRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["CoursesRead"] | null;
        };
        CourseDataUpdate: {
            course?: string | null;
            teacher?: string | null;
            day?: ("周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日") | null;
            startTime?: string | null;
            endTime?: string | null;
        };
        PaginatedResponse_TalksRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_TalksRead_"] | null;
        };
        PaginatedData_TalksRead_: {
            items: components["schemas"]["TalksRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        TalksRead: {
            studentId: string;
            date: string;
            note: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        TalkData: {
            studentId: string;
            date: string;
            note: string;
        };
        ResponseModel_TalksRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["TalksRead"] | null;
        };
        TalkDataUpdate: {
            studentId?: string | null;
            date?: string | null;
            note?: string | null;
        };
        PaginatedResponse_ContactsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_ContactsRead_"] | null;
        };
        PaginatedData_ContactsRead_: {
            items: components["schemas"]["ContactsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        ContactsRead: {
            studentId: string;
            date: string;
            note: string;
            method: "电话" | "微信" | "面谈" | "家访";
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        ContactData: {
            studentId: string;
            date: string;
            note: string;
            method: "电话" | "微信" | "面谈" | "家访";
        };
        ResponseModel_ContactsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ContactsRead"] | null;
        };
        ContactDataUpdate: {
            studentId?: string | null;
            date?: string | null;
            note?: string | null;
            method?: ("电话" | "微信" | "面谈" | "家访") | null;
        };
        PaginatedResponse_TrainingRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_TrainingRecordsRead_"] | null;
        };
        PaginatedData_TrainingRecordsRead_: {
            items: components["schemas"]["TrainingRecordsRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        TrainingRecordsRead: {
            category: "培训" | "讲座" | "活动";
            title: string;
            hours: string;
            date: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        TrainingRecordData: {
            category: "培训" | "讲座" | "活动";
            title: string;
            hours: number | string;
            date: string;
        };
        ResponseModel_TrainingRecordsRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["TrainingRecordsRead"] | null;
        };
        TrainingRecordDataUpdate: {
            category?: ("培训" | "讲座" | "活动") | null;
            title?: string | null;
            hours?: number | string | null;
            date?: string | null;
        };
        PaginatedResponse_LinksRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_LinksRead_"] | null;
        };
        PaginatedData_LinksRead_: {
            items: components["schemas"]["LinksRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        LinksRead: {
            title: string;
            url: string;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        LinkData: {
            title: string;
            url: string;
        };
        ResponseModel_LinksRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["LinksRead"] | null;
        };
        LinkDataUpdate: {
            title?: string | null;
            url?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    send_sms_api_v1_auth_sms_send_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendSmsRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    phone_login_api_v1_auth_phone_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneLoginRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    phone_bind_api_v1_auth_phone_bind_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BindPhoneRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UserResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    miniapp_login_api_v1_auth_miniapp_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MiniappLoginRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    refresh_token_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_Token_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_me_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UserResponse_"];
                };
            };
        };
    };
    list_scan_apps_api_v1_auth_scan_apps_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_list_ScanAppResponse__"];
                };
            };
        };
    };
    create_scan_session_api_v1_auth_scan_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanCreateRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ScanCreateResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    poll_scan_session_api_v1_auth_scan_sessions__transaction_id__get: {
        parameters: {
            query?: never;
            header: {
                "X-Scan-Token": string;
            };
            path: {
                transaction_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ScanPollResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    exchange_scan_api_v1_auth_scan_exchange_post: {
        parameters: {
            query?: never;
            header: {
                "X-Scan-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanExchangeRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_classes_api_v1_teacher_logbook_classes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_list_ClassRead__"];
                };
            };
        };
    };
    create_class_api_v1_teacher_logbook_classes_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ClassRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_students_api_v1_teacher_logbook_classes__class_id__students_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                keyword?: string | null;
                gender?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_student_api_v1_teacher_logbook_classes__class_id__students_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StudentCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_student_api_v1_teacher_logbook_classes__class_id__students__student_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StudentUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_student_api_v1_teacher_logbook_classes__class_id__students__student_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StudentUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_class_api_v1_teacher_logbook_classes__class_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ClassRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_class_api_v1_teacher_logbook_classes__class_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_class_api_v1_teacher_logbook_classes__class_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ClassRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    export_students_api_v1_teacher_logbook_classes__class_id__students_export_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    import_students_api_v1_teacher_logbook_classes__class_id__students_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_import_students_api_v1_teacher_logbook_classes__class_id__students_import_post"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ImportResult_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_seat_board_api_v1_teacher_logbook_classes__class_id__seat_board_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_SeatBoardResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_seat_layout_api_v1_teacher_logbook_classes__class_id__seat_board_layout_put: {
        parameters: {
            query?: never;
            header?: {
                "If-Match"?: string | null;
            };
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LayoutUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_SeatLayoutResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    move_student_api_v1_teacher_logbook_classes__class_id__seat_board_assignments__student_id__put: {
        parameters: {
            query?: never;
            header?: {
                "If-Match"?: string | null;
            };
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SeatMove"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_student_seat_api_v1_teacher_logbook_classes__class_id__seat_board_assignments__student_id__delete: {
        parameters: {
            query?: never;
            header?: {
                "If-Match"?: string | null;
            };
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    batch_seats_api_v1_teacher_logbook_classes__class_id__seat_board_assignments_put: {
        parameters: {
            query?: never;
            header?: {
                "If-Match"?: string | null;
            };
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SeatBatch"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    clear_seats_api_v1_teacher_logbook_classes__class_id__seat_board_assignments_delete: {
        parameters: {
            query?: never;
            header?: {
                "If-Match"?: string | null;
            };
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    dashboard_api_v1_teacher_logbook_classes__class_id__dashboard_get: {
        parameters: {
            query?: {
                date?: string;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_DashboardRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    finance_summary_api_v1_teacher_logbook_classes__class_id__finance_summary_get: {
        parameters: {
            query?: {
                dateFrom?: string | null;
                dateTo?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_FinanceSummary_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    training_summary_api_v1_teacher_logbook_classes__class_id__training_summary_get: {
        parameters: {
            query?: {
                dateFrom?: string | null;
                dateTo?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TrainingSummary_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_alert_status_api_v1_teacher_logbook_classes__class_id__alerts__item_id__status_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_alert_status_api_v1_teacher_logbook_classes__class_id__alerts__item_id__status_patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_todo_status_api_v1_teacher_logbook_classes__class_id__todos__item_id__status_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_todo_status_api_v1_teacher_logbook_classes__class_id__todos__item_id__status_patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UiPreferenceRead_"];
                };
            };
        };
    };
    update_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UiPreferenceUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UiPreferenceRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_ui_preference_api_v1_teacher_logbook_users_me_preferences_ui_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UiPreferenceUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UiPreferenceRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    export_backup_api_v1_teacher_logbook_classes__class_id__backup_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    validate_backup_api_v1_teacher_logbook_classes__class_id__backup_validate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_validate_backup_api_v1_teacher_logbook_classes__class_id__backup_validate_post"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_BackupValidation_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    restore_backup_api_v1_teacher_logbook_classes__class_id__backup_restore_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_restore_backup_api_v1_teacher_logbook_classes__class_id__backup_restore_post"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_BackupValidation_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    clear_class_data_api_v1_teacher_logbook_classes__class_id__data_clear_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClearDataRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    import_legacy_data_api_v1_teacher_logbook_classes__class_id__legacy_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_import_legacy_data_api_v1_teacher_logbook_classes__class_id__legacy_import_post"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_BackupValidation_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_LeaveRequestsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeaveRequestData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LeaveRequestsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LeaveRequestsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeaveRequestDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LeaveRequestsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_leave_requests_api_v1_teacher_logbook_classes__class_id__leave_requests__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeaveRequestDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LeaveRequestsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_HomeworkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HomeworkRecordData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HomeworkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HomeworkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HomeworkRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HomeworkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_homework_records_api_v1_teacher_logbook_classes__class_id__homework_records__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HomeworkRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HomeworkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_violations_api_v1_teacher_logbook_classes__class_id__violations_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_ViolationsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_violations_api_v1_teacher_logbook_classes__class_id__violations_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ViolationData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ViolationsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ViolationsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ViolationDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ViolationsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_violations_api_v1_teacher_logbook_classes__class_id__violations__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ViolationDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ViolationsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_alerts_api_v1_teacher_logbook_classes__class_id__alerts_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_AlertsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_alerts_api_v1_teacher_logbook_classes__class_id__alerts_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlertData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AlertsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AlertsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlertDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AlertsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_alerts_api_v1_teacher_logbook_classes__class_id__alerts__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlertDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AlertsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_todos_api_v1_teacher_logbook_classes__class_id__todos_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_TodosRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_todos_api_v1_teacher_logbook_classes__class_id__todos_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TodosRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TodosRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TodosRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_todos_api_v1_teacher_logbook_classes__class_id__todos__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TodosRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_work_records_api_v1_teacher_logbook_classes__class_id__work_records_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_WorkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_work_records_api_v1_teacher_logbook_classes__class_id__work_records_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_WorkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_WorkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_WorkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_work_records_api_v1_teacher_logbook_classes__class_id__work_records__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_WorkRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_exams_api_v1_teacher_logbook_classes__class_id__exams_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_ExamsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_exams_api_v1_teacher_logbook_classes__class_id__exams_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExamData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ExamsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ExamsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExamDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ExamsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_exams_api_v1_teacher_logbook_classes__class_id__exams__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExamDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ExamsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_CommitteeRolesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeRoleData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeRolesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeRolesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeRoleDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeRolesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_committee_roles_api_v1_teacher_logbook_classes__class_id__committee_roles__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeRoleDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeRolesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_CommitteeMembersRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeMemberData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeMembersRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeMembersRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeMemberDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeMembersRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_committee_members_api_v1_teacher_logbook_classes__class_id__committee_members__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitteeMemberDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CommitteeMembersRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_HygieneAssignmentsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HygieneAssignmentData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HygieneAssignmentsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HygieneAssignmentsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HygieneAssignmentDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HygieneAssignmentsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_hygiene_assignments_api_v1_teacher_logbook_classes__class_id__hygiene_assignments__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HygieneAssignmentDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_HygieneAssignmentsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_activities_api_v1_teacher_logbook_classes__class_id__activities_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_ActivitiesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_activities_api_v1_teacher_logbook_classes__class_id__activities_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ActivitiesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ActivitiesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ActivitiesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_activities_api_v1_teacher_logbook_classes__class_id__activities__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DatedNoteDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ActivitiesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_FinanceRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FinanceRecordData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_FinanceRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_FinanceRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FinanceRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_FinanceRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_finance_records_api_v1_teacher_logbook_classes__class_id__finance_records__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FinanceRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_FinanceRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_awards_api_v1_teacher_logbook_classes__class_id__awards_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_AwardsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_awards_api_v1_teacher_logbook_classes__class_id__awards_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AwardData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AwardsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AwardsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AwardDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AwardsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_awards_api_v1_teacher_logbook_classes__class_id__awards__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AwardDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_AwardsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_courses_api_v1_teacher_logbook_classes__class_id__courses_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_CoursesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_courses_api_v1_teacher_logbook_classes__class_id__courses_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CourseData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CoursesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CoursesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CourseDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CoursesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_courses_api_v1_teacher_logbook_classes__class_id__courses__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CourseDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_CoursesRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_talks_api_v1_teacher_logbook_classes__class_id__talks_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_TalksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_talks_api_v1_teacher_logbook_classes__class_id__talks_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TalkData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TalksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TalksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TalkDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TalksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_talks_api_v1_teacher_logbook_classes__class_id__talks__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TalkDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TalksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_contacts_api_v1_teacher_logbook_classes__class_id__contacts_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_ContactsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_contacts_api_v1_teacher_logbook_classes__class_id__contacts_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ContactsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ContactsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ContactsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_contacts_api_v1_teacher_logbook_classes__class_id__contacts__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ContactsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_training_records_api_v1_teacher_logbook_classes__class_id__training_records_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_TrainingRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_training_records_api_v1_teacher_logbook_classes__class_id__training_records_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TrainingRecordData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TrainingRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TrainingRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TrainingRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TrainingRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_training_records_api_v1_teacher_logbook_classes__class_id__training_records__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TrainingRecordDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_TrainingRecordsRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_links_api_v1_teacher_logbook_classes__class_id__links_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                studentId?: string | null;
                dateFrom?: string | null;
                dateTo?: string | null;
                keyword?: string | null;
                status?: string | null;
                reason?: string | null;
                subject?: string | null;
                type?: string | null;
                level?: string | null;
                day?: string | null;
                method?: string | null;
                category?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_LinksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_links_api_v1_teacher_logbook_classes__class_id__links_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LinkData"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LinksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_links_api_v1_teacher_logbook_classes__class_id__links__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LinksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_compatible_links_api_v1_teacher_logbook_classes__class_id__links__item_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LinkDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LinksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_links_api_v1_teacher_logbook_classes__class_id__links__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_links_api_v1_teacher_logbook_classes__class_id__links__item_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LinkDataUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LinksRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
