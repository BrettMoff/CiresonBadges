/* Badges Active Work */
WITH cte_ActiveWorkItems (WorkItemId, IsNoAssignedUser, IsStaleWorkItem)  
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
)

select 
	COUNT(cte_ActiveWorkItems.WorkItemId) as WorkItemCount
	,COUNT(cte_ActiveWorkItems.IsNoAssignedUser) as WorkItemsWithNoAssignedUserCount
	,COUNT( IsStaleWorkItem) as StaleWorkItemCount
	
from cte_ActiveWorkItems
