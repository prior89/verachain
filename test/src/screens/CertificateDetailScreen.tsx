
import React from 'react';
import { View, Text } from 'react-native';

export default function CertificateDetailScreen({ route }: any) {
  const { id } = route.params ?? {};
  const showTxId = false; // TBD by policy
  const txId = '0x...';

  return (
    <View style={{ flex:1, padding:16, backgroundColor:'#fff' }}>
      <Text style={{ fontSize:20, fontWeight:'800', color:'#111' }}>{id}</Text>
      <Text style={{ marginTop:6, color:'#222' }}>Product: (name)</Text>
      <Text style={{ color:'#222' }}>Owner: (address)</Text>
      <Text style={{ color:'#222' }}>Status: Active</Text>
      {showTxId && <Text style={{ marginTop:6, fontSize:12, color:'#666' }}>TxID: {txId}</Text>}
    </View>
  );
}
