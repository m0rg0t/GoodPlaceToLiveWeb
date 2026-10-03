import {test} from 'node:test';import assert from 'node:assert/strict';
import {createLegacyProvider,normalizeItem,calcCoef} from '../src/legacy-adapter.js';
test('legacy adapter preserves HTTPS client and HospitalAdultItem read contract using synthetic client',async()=>{
 let args;class Fake{constructor(...a){args=a;}getTable(name){assert.equal(name,'HospitalAdultItem');return{read:async()=>[{FullName:'Synthetic'}]};}}
 const provider=createLegacyProvider({endpoint:'https://fixture.invalid',applicationKey:'synthetic-public-id'},Fake);assert.deepEqual(await provider(),[{FullName:'Synthetic'}]);assert.deepEqual(args,['https://fixture.invalid','synthetic-public-id']);
});
test('missing configuration and non-HTTPS services fail safely',()=>{assert.throws(()=>createLegacyProvider({}),/не настроен/);assert.throws(()=>createLegacyProvider({endpoint:'http://fixture.invalid',applicationKey:'fixture'},class{}),/HTTPS/);});
test('coordinate normalization and coefficient guard',()=>{assert.equal(normalizeItem({Y:'55,75',X:'37,62',ContractSum:'100'}).latitude,55.75);for(const value of [null,undefined,'invalid',999])assert.equal(normalizeItem({Y:value,X:37,ContractSum:10}),null);assert.equal(calcCoef(100,0),0);assert.equal(calcCoef(100,10),10);});
