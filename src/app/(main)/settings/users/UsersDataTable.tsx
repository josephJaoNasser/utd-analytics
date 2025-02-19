'use client';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import UsersHeader from './UsersHeader';
import useCache from 'store/cache';

export function UsersDataTable() {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.users);
  const queryResult = useFilterQuery({
    queryKey: ['users', { modified }],
    queryFn: (params: { [key: string]: any }) => get(`/admin/users`, params),
  });

  const handleChange = () => {
    queryResult.refetch();
  };

  return (
    <>
      <UsersHeader />
      <DataTable queryResult={queryResult}>
        {({ data }) => <UsersTable data={data} onRemove={handleChange} />}
      </DataTable>
    </>
  );
}

export default UsersDataTable;
