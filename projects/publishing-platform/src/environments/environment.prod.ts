import {
  backend,
  currentVersion,
  daemonAddressFirst,
  daemonAddressSecond,
  dsBackend,
  explorerAddress,
  GA_ID,
  froalaEditorKey,
  filestorageLink,
  daemonHttpsAddress,
  mainSiteUrl
} from './parameters';

export const environment = {
  production: true,
  backend: backend,
  ds_backend: dsBackend,
  daemon_address_first: daemonAddressFirst,
  daemon_address_second: daemonAddressSecond,
  currentVersion: currentVersion,
  explorerAddress: explorerAddress,
  google_analytics_id: GA_ID,
  froala_editor_key: froalaEditorKey,
  filestorage_link: filestorageLink,
  daemon_https_address: daemonHttpsAddress,
  main_site_url: mainSiteUrl
};
