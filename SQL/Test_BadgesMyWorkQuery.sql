/* Badges My Work */
declare @UserId uniqueidentifier = '18b0fd23-cac6-71da-1a03-57b5e9165ca9' -- ''{{@UserId}}'' Only use this for manual testing with my specific GUID. Delete or omit this line in the Portal.

/* Badges My Work */

Select WorkItemId as [Id]
	,WorkItem.LastModified
from ServiceManagement.dbo.WorkItem
inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus on DisplayStringStatus.ElementID = WorkItem.StatusId
	and DisplayStringStatus.LocaleID = 'ENU'
	and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled', 'Pending')

outer apply (
	select top 1 * from ServiceManagement.dbo.WorkItem$Review as ReviewObjects
	where ReviewObjects.ReviewActivityId = WorkItem.Id 
		and ReviewObjects.ReviewerId is not null
	order by ReviewObjects.ReviewId Desc --newer reviewers are more likely to have a person, instead of the OOB blank entry.
) as ReviewObjects

where (
		WorkItem.AssignedUserId = @UserId --@UserId is a special Cireson token for the logged-in user GUID.
		OR ReviewObjects.ReviewerId = @UserId
		OR WorkItem.PrimaryOwnerId = @UserId)
		and ('True' = 'True' or WorkItem.ClassId NOT IN --True = True is used to determine if Show activities should be enabled
					(
						'7AC62BD4-8FCE-A150-3B40-16A39A61383D', --MA
						'BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36' --RA
					)
				)
)
	
order by WorkItem.LastModified Desc