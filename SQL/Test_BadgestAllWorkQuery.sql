/* Badges All Work */
SELECT 
	WorkItem.WorkItemId
	,DisplayString_Status.displaystring as WIStatus
	,AssignedUser
	,WorkItem.LastModified
FROM ServiceManagement.dbo.WorkItem

LEFT JOIN ServiceManagement.dbo.DisplayString as DisplayString_Status 
	ON WorkItem.StatusId = DisplayString_Status.ElementID

WHERE 
	WorkItem.StatusId in ('5E2D3932-CA6D-1515-7310-6F58584DF73E', '59393F48-D85F-FA6D-2EBE-DCFF395D7ED1', 'A52FBC7D-0EE3-C630-F820-37EAE24D6E9B')

