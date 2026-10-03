import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {resolveProvider,normalizeItem,calcCoef} from './legacy-adapter.js';
L.Icon.Default.mergeOptions({iconUrl,iconRetinaUrl,shadowUrl});
const status=document.getElementById('data-status');
const map=L.map('map',{zoomControl:false}).setView([55.75,37.62],10);
L.control.zoom({position:'topright'}).addTo(map);
const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
tiles.on('tileerror',()=>{if(!status.textContent)status.textContent='Не удалось загрузить карту.';});
const markers=L.layerGroup().addTo(map),lines=L.layerGroup().addTo(map),selection=L.layerGroup().addTo(map);
let items=[],origin=null;
function textPopup(item,distance){const node=document.createElement('div');node.textContent=`${item.FullName ?? ''}\n${item.Address ?? ''}\nСумма контрактов - ${Math.round(item.ContractSum)} руб.${distance==null?'':`\nРасстояние - ${Math.round(distance)}\nКоэффициент привлекательности - ${calcCoef(item.ContractSum,distance)}`}`;node.style.whiteSpace='pre-line';return node;}
function update(point){let count=0,sum=0,coefficient=0;lines.clearLayers();for(const item of items){const distance=point?point.distanceTo(item.placeLatLon):Infinity;if(distance<3001){count++;sum+=Math.round(item.ContractSum);coefficient+=calcCoef(item.ContractSum,distance);L.polyline([item.placeLatLon,point],{color:'green'}).addTo(lines).bindPopup(textPopup(item,distance));}}document.getElementById('objects_count').textContent=count;document.getElementById('sum_count').textContent=sum;document.getElementById('maink').textContent=coefficient;}
map.on('click',e=>{selection.clearLayers();L.circle(e.latlng,{radius:3000,color:'#2AA300'}).addTo(selection);update(e.latlng);});
map.on('locationfound',e=>{origin=e.latlng;selection.clearLayers();L.circle(origin,{radius:e.accuracy/2}).addTo(selection);update(origin);});
map.on('locationerror',()=>{if(!status.textContent)status.textContent='Местоположение недоступно. Выберите точку на карте.';});
// Data loading is independent of geolocation success/failure and only occurs once.
async function load(){status.textContent='Загрузка данных…';try{const provider=await resolveProvider();const records=await provider();if(!Array.isArray(records))throw new Error('Некорректный ответ источника данных.');items=records.map(normalizeItem).filter(Boolean).map(item=>({...item,placeLatLon:L.latLng(item.latitude,item.longitude)}));markers.clearLayers();for(const item of items)L.marker(item.placeLatLon).addTo(markers).bindPopup(textPopup(item));status.textContent=items.length?'':'Нет доступных объектов.';update(origin);}catch(error){status.textContent=error.message || 'Не удалось загрузить данные.';}}
load();map.locate({setView:true,maxZoom:16});
const toggle=document.querySelector('.navbar-toggle'),navigation=document.getElementById('navigation');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
