'use client';
import { Icon, Loading } from 'react-basics';
import Icons from 'components/icons';
import { usePathname } from 'next/navigation';
import Page from 'components/layout/Page';
import FilterTags from 'components/metrics/FilterTags';
import useNavigation from 'components/hooks/useNavigation';
import { useWebsite } from 'components/hooks';
import WebsiteChart from './WebsiteChart';
import WebsiteExpandedView from './WebsiteExpandedView';
import WebsiteHeader from './WebsiteHeader';
import WebsiteMetricsBar from './WebsiteMetricsBar';
import WebsiteTableView from './WebsiteTableView';
import TrackingCode from 'app/(main)/settings/websites/[id]/TrackingCode';
import styles from './WebsiteHeader.module.css';

export default function WebsiteDetails({ websiteId }: { websiteId: string }) {
  const { data: website, isLoading, error } = useWebsite(websiteId);
  const pathname = usePathname();
  const showLinks = !pathname.includes('/share/');

  const {
    query: { view, url, referrer, os, browser, device, country, region, city, title },
  } = useNavigation();

  if (isLoading || error) {
    return <Page isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} showLinks={showLinks} />
      <FilterTags params={{ url, referrer, os, browser, device, country, region, city, title }} />
      <WebsiteMetricsBar websiteId={websiteId} sticky={true} />
      <WebsiteChart websiteId={websiteId} />
      {!website && <Loading icon="dots" style={{ minHeight: 300 }} />}
      {website && (
        <>
          {!view && <WebsiteTableView websiteId={websiteId} domainName={website.domain} />}
          {view && <WebsiteExpandedView websiteId={websiteId} domainName={website.domain} />}
        </>
      )}

      <div style={{ marginTop: 30 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            width: 'max-content',
            gap: '10px',
          }}
        >
          <Icon className={styles.icons}>
            <Icons.Code />
          </Icon>
          <h3 style={{ fontWeight: 'bold' }}>Tracking code</h3>
        </div>
        <TrackingCode websiteId={websiteId} />
      </div>
    </>
  );
}
