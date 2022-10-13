/* Badges Team Work */
WITH cte_ActiveWorkItems (WorkItemId, LastModified)  
AS
(
	SELECT 
		WorkItem.WorkItemId
		,WorkItem.LastModified
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
		WHERE u.Id = 'f47d069b-29aa-c42c-cd58-460389926cb1'
	) sg ON COALESCE(sg.TierId, '00000000-0000-0000-0000-000000000000') = COALESCE(WorkItem.TierId, '00000000-0000-0000-0000-000000000000')
where (sg.NavNode = 'TeamWork' OR COALESCE(WorkItem.AssignedUserId, '00000000-0000-0000-0000-000000000000') = 'f47d069b-29aa-c42c-cd58-460389926cb1')
			and DisplayStringStatus.LocaleID = 'ENU'
			and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled')
			--and WorkItem.ClassId NOT IN
		--(
			--'7AC62BD4-8FCE-A150-3B40-16A39A61383D', --MA
			--'BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36' --RA
		--)
)
select 
	cte_ActiveWorkItems.WorkItemId as WorkItemID,
	cte_ActiveWorkItems.LastModified as LastModified
from cte_ActiveWorkItems