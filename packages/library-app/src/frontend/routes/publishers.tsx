import { createResource } from 'solid-js';
import { trpc } from '@/frontend/trpc';
import ReferenceDataView from '@/frontend/components/ReferenceDataView';

const PublishersList = () => {
  const [publishers, { refetch }] = createResource(async () => await trpc.publishers.list.query());

  return (
    <ReferenceDataView
      title="Publishers Directory"
      itemName="Publisher"
      listResource={publishers}
      listWithCountsResource={trpc.publishers.listWithCounts}
      createMutation={trpc.publishers.create}
      updateMutation={trpc.publishers.update}
      deleteMutation={trpc.publishers.delete}
      refetchList={refetch}
      filterKey="publisherId"
    />
  );
};

export default PublishersList;
