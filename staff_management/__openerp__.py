{
	"name" : "Staff Management",
	"version" : "1.8.1",
	"author" : "Luis Domingues & Romain Monnard",
	"category" : "Staff Management",
	"description" : "Management of time and task of staff.",
	"depends" : [
		'base',
		'web_calendar',
		'hr_timesheet_sheet'
	],
	"js": [
		'static/lib/*.js',
		'static/*/js/*.js'
	],
	"css": ['static/*/css/*.css'],
	"init_xml" : [],
	"demo_xml" : [],
	"update_xml" : ['security/staff_management_security.xml',
		'security/ir.model.access.csv',
		'staff_management.xml',
		'staff_tasks_accounts.xml',
		'staff_comment_type.xml',
		'staff_authorization.xml',
		'staff_comments.xml',
		'staff_events.xml',
		'staff_booking_type.xml',
		'staff_booking.xml',
		'staff_break_management.xml',
		'staff_pay_push.xml'],
	"installable" : True,
	"active" : False,
	"qweb" : ['static/*/xml/*.xml']
}
