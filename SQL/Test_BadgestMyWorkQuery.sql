/* Badges My Work */
declare @UserId uniqueidentifier = '18b0fd23-cac6-71da-1a03-57b5e9165ca9' -- ''{{@UserId}}'' Only use this for manual testing with my specific GUID. Delete or omit this line in the Portal.

Select 
	WorkItem.WorkItemId as [Id]
	,WorkItem.LastModified
from ServiceManagement.dbo.WorkItem
inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus on DisplayStringStatus.ElementID = WorkItem.StatusId
	and DisplayStringStatus.LocaleID = 'ENU'
	and DisplayStringStatus.DisplayString not in ('Resolved', 'Closed', 'Completed', 'Failed', 'Skipped', 'Cancelled')

outer apply (
	select top 1 * from ServiceManagement.dbo.WorkItem$Review as ReviewObjects
	where ReviewObjects.ReviewActivityId = WorkItem.Id 
		and ReviewObjects.ReviewerId is not null
	order by ReviewObjects.ReviewId Desc --newer reviewers are more likely to have a person, instead of the OOB blank entry.
) as ReviewObjects

where (
		WorkItem.AssignedUserId = @UserId --@UserId is a special Cireson token for the logged-in user GUID.
		OR ReviewObjects.ReviewerId = @UserId OR WorkItem.PrimaryOwnerId = @UserId
)
	
order by WorkItem.LastModified Desc
