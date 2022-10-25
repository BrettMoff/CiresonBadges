/* Badges Team Work */
WITH cte_ActiveWorkItems (WorkItemId, IsNoAssignedUser, IsStaleWorkItem)  
AS
(
	SELECT 
		WorkItem.WorkItemId
		,IIF(AssignedUser is null, 1, null) as IsNoAssignedUser
		,IIF(WorkItem.LastModified < GETUTCDATE()-5, 1, null) as IsStaleWorkItem
	FROM ServiceManagement.dbo.WorkItem
	inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus 
		on DisplayStringStatus.ElementID = WorkItem.StatusId
		and DisplayStringStatus.LocaleID = 'ENU'
		and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled', 'Converted to SR')
	LEFT JOIN
	(
		SELECT DISTINCT sgm.EnumerationId AS TierId, 'TeamWork' AS NavNode
		FROM CI$User u 
		INNER JOIN GroupMembership_CI$DomainGroup_CI$User gu ON u.Id = gu.UserId
		INNER JOIN SupportGroupMapping_CI$DomainGroup_Enumeration sgm ON gu.DomainGroupId = sgm.DomainGroupId
		WHERE u.Id = @UserId
	) sg ON COALESCE(sg.TierId, '00000000-0000-0000-0000-000000000000') = COALESCE(WorkItem.TierId, '00000000-0000-0000-0000-000000000000')
where (sg.NavNode = 'TeamWork' OR COALESCE(WorkItem.AssignedUserId, '00000000-0000-0000-0000-000000000000') = @UserId)
			and DisplayStringStatus.LocaleID = 'ENU'
			and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled', 'Pending')
			and ('True' = 'True' or WorkItem.ClassId NOT IN
					(
						'7AC62BD4-8FCE-A150-3B40-16A39A61383D', --MA
						'BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36' --RA
					)
				)
)
select  
	COUNT(cte_ActiveWorkItems.WorkItemId) as WorkItemCount
	,COUNT(cte_ActiveWorkItems.IsNoAssignedUser) as WorkItemsWithNoAssignedUserCount
	,COUNT( IsStaleWorkItem) as StaleWorkItemCount
	
from cte_ActiveWorkItems