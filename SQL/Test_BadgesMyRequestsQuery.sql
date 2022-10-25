declare @UserId uniqueidentifier = '18b0fd23-cac6-71da-1a03-57b5e9165ca9'; -- ''{{@UserId}}'' Only use this for manual testing with my specific GUID. Delete or omit this line in the Portal.
--Ignore the above line in the actual Portal script.

/* Badges My Requests */
WITH cte_MyRequests (WorkItemId, IsNoAssignedUser, IsStaleWorkItem)  
AS
(
	SELECT 
		WorkItem.WorkItemId
		,IIF(AssignedUser is null, 1, null) as IsNoAssignedUser
		,IIF(WorkItem.LastModified < GETUTCDATE()-3, 1, null) as IsStaleWorkItem
	FROM ServiceManagement.dbo.WorkItem

	inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus 
		on DisplayStringStatus.ElementID = WorkItem.StatusId
		and DisplayStringStatus.LocaleID = 'ENU'
		and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled')

	WHERE WorkItem.ClassId not in ('7AC62BD4-8FCE-A150-3B40-16A39A61383D', 'BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36') --dont include activities
	AND (
		WorkItem.AffectedUserId = @UserId 
		OR ( WorkItem.AffectedUserId is null AND  WorkItem.CreatedByUserId = @UserId )
	)
)

select 
	COUNT(cte_MyRequests.WorkItemId) as WorkItemCount
	,COUNT(cte_MyRequests.IsNoAssignedUser) as WorkItemsWithNoAssignedUserCount
	,COUNT(IsStaleWorkItem) as StaleWorkItemCount
	
from cte_MyRequests