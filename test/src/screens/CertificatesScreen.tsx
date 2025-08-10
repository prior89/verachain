
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import EmptyState from '../components/EmptyState';
import { useNavigation } from '@react-navigation/native';

type Cert = { id: string; productName: string; owner: string; status: 'active' | 'burned'; chain?: string; txId?: string };

const MOCK: Cert[] = [
  { id:'VC-001', productName:'Bag A', owner:'0xBuyer', status:'active' },
  { id:'VC-002', productName:'Watch B', owner:'0xSeller', status:'burned' },
];

export default function CertificatesScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all'|'active'|'burned'>('all');

  const data = useMemo(() => MOCK.filter(c =>
    (status==='all' || c.status===status) &&
    (q==='' || c.id.toLowerCase().includes(q.toLowerCase()) || c.productName.toLowerCase().includes(q.toLowerCase()))
  ), [q, status]);

  return (
    <View style={{ flex:1, padding:16, backgroundColor:'#fff' }}>
      <SearchBar value={q} onChange={setQ} placeholder="Search certificate ID or product name" />
      <Filters value={status} onChange={setStatus} options={[
        { label:'All', value:'all' },
        { label:'Active', value:'active' },
        { label:'Burned', value:'burned' },
      ]} />

      {data.length === 0 ? <EmptyState title="No certificates" subtitle="Try a different search or filter." /> :
        <FlatList
          data={data}
          keyExtractor={(item)=>item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => nav.navigate('CertificateDetail', { id:item.id })} style={{ paddingVertical:14, borderBottomWidth:1, borderColor:'#eee' }}>
              <Text style={{ fontWeight:'700', color:'#111' }}>{item.id} · {item.productName}</Text>
              <Text style={{ color:'#666', marginTop:4 }}>Owner: {item.owner} · Status: {item.status}</Text>
            </TouchableOpacity>
          )}
        />
      }
    </View>
  );
}
