import { createResource } from 'solid-js';
import { trpc } from '@/frontend/trpc';
import ReferenceDataView from '@/frontend/components/ReferenceDataView';

const GenresList = () => {
  const [genres, { refetch }] = createResource(async () => await trpc.genres.list.query());

  return (
    <ReferenceDataView
      title="Genres Directory"
      itemName="Genre"
      listResource={genres}
      listWithCountsResource={trpc.genres.listWithCounts}
      createMutation={trpc.genres.create}
      updateMutation={trpc.genres.update}
      deleteMutation={trpc.genres.delete}
      refetchList={refetch}
      filterKey="genreId"
    />
  );
};

export default GenresList;
