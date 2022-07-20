import moment from 'moment';
import authConfigs from 'constants/authConfigs';

export function setLatestRequestTime() {
  localStorage.setItem(
    authConfigs.prevLatestRequestLsKey,
    localStorage.getItem(authConfigs.latestRequestLsKey)
  );
  localStorage.setItem(authConfigs.latestRequestLsKey, moment().toISOString());
}
