--Create_BadgesMyWorkQuery.sql
--use a GUID generator to create some new guids for your view panel and navigation node.  NOTE: All guids must be completely lower case. Powershell syntax [GUID]::NewGuid()
DECLARE @DataSourceGuid uniqueidentifier			= '6DAF2352-3661-A776-47FB-9EE52BC47881'

-- set the query title
DECLARE @QueryTitle nvarchar(255)  					= 'My Work Items'

--Create the datasource query.
DECLARE @Query nvarchar(max) = '
/* Badges My Work */

Select WorkItemId as [Id]
	,WorkItem.LastModified
from ServiceManagement.dbo.WorkItem
inner join ServiceManagement.dbo.DisplayString as DisplayStringStatus on DisplayStringStatus.ElementID = WorkItem.StatusId
	and DisplayStringStatus.LocaleID = ''ENU''
	and DisplayStringStatus.DisplayString not in (''Resolved'', ''Closed'', ''Completed'', ''Failed'', ''Skipped'', ''Cancelled'', ''Pending'')

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
';

DELETE FROM [ServiceManagement].[dbo].[DataSource] where DataSource.Id = @DataSourceGuid;
INSERT INTO [ServiceManagement].[dbo].[DataSource] (Id, Title, ConnectionString, Query)
VALUES (@DataSourceGuid, 'Badges - ' + @QueryTitle, NULL, @Query);
--end

