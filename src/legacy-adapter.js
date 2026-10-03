export const SDK_URL = 'https://ajax.aspnetcdn.com/ajax/mobileservices/MobileServices.Web-1.1.3.min.js';
export function createLegacyProvider(config, MobileServiceClient) {
  if (!config?.endpoint || !config?.applicationKey) throw new Error('Источник данных не настроен. Требуется настройка владельцем сайта.');
  if (new URL(config.endpoint).protocol !== 'https:') throw new Error('Источник данных должен использовать HTTPS.');
  if (typeof MobileServiceClient !== 'function') throw new Error('Не удалось загрузить библиотеку источника данных.');
  const client = new MobileServiceClient(config.endpoint, config.applicationKey);
  return () => client.getTable('HospitalAdultItem').read();
}
export async function resolveProvider(scope = window) {
  if (typeof scope.goodPlaceDataProvider === 'function') return scope.goodPlaceDataProvider;
  const config = scope.goodPlaceConfig;
  if (!config?.endpoint || !config?.applicationKey) return createLegacyProvider(config);
  if (!scope.WindowsAzure?.MobileServiceClient) await new Promise((resolve,reject)=>{
    const script = scope.document.createElement('script'); script.src=SDK_URL;
    const timer=setTimeout(()=>{script.remove();reject(new Error('Превышено время загрузки источника данных.'));},10000);
    script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);reject(new Error('Не удалось загрузить библиотеку источника данных.'));};scope.document.head.append(script);
  });
  return createLegacyProvider(config,scope.WindowsAzure?.MobileServiceClient);
}
export function normalizeItem(item) {
  const number=value=>Number(String(value ?? '').replace(',','.'));
  const latitude=number(item.Y),longitude=number(item.X),sum=number(item.ContractSum);
  if (item.Y == null || item.X == null || !Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180||!Number.isFinite(sum)) return null;
  return {...item, latitude,longitude,ContractSum:sum};
}
export function calcCoef(sum,distance){return distance>0?Math.round(sum/distance):0;}
