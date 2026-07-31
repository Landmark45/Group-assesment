import { Link } from 'react-router-dom';

import { Button } from '../shared/components/Button';
import { EmptyState } from '../shared/components/AsyncStates';
import { PageContainer } from '../shared/components/Layout';

export function NotFoundPage(): JSX.Element {
  return (
    <PageContainer>
      <EmptyState
        variant="search"
        headline="There is nothing at this address"
        body="The link may be out of date, or there might be a typo in it. The catalog is a good place to start again."
        action={
          <Link to="/courses">
            <Button type="button" as="span">
              Back to the catalog
            </Button>
          </Link>
        }
      />
    </PageContainer>
  );
}
