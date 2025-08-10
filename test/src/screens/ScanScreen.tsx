
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import QRScanner from '../components/QRScanner';
import { useScanFlow } from '../state/ScanFlowContext';

export default function ScanScreen() {
  const { stage, role, txId, reset, onProductRecognized, onCertificateRecognized } = useScanFlow();

  if (stage === 'idle') {
    return (
      <View style={{ flex:1 }}>
        <QRScanner mode="product" onScanned={(data) => onProductRecognized({ productId: data })} />
      </View>
    );
  }

  if (stage === 'product_scanned') {
    return (
      <View style={{ flex:1 }}>
        <QRScanner
          mode="certificate"
          onScanned={(qr) => {
            const inferredRole = qr.toLowerCase().includes('seller') ? 'seller' : 'buyer';
            onCertificateRecognized({ qr, role: inferredRole as any });
          }}
        />
        <View style={{ position:'absolute', top:12, alignSelf:'center', backgroundColor:'#6B4FE3', padding:8, borderRadius:8 }}>
          <Text style={{ color:'#fff' }}>Product verified. Now scan the certificate / QR.</Text>
        </View>
      </View>
    );
  }

  if (stage === 'done') {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:24 }}>
        <Text style={{ fontSize:22, fontWeight:'800', marginBottom:6, color:'#111' }}>Verification Complete</Text>
        <Text style={{ fontSize:15, textAlign:'center', marginBottom:14 }}>
          {role === 'seller' ? 'Burn processed (seller).' : 'Mint issued (buyer).'}
        </Text>
        {txId ? <Text style={{ fontSize:12, color:'#666' }}>TxID: {txId}</Text> : null}
        <TouchableOpacity onPress={reset} style={{ marginTop:20, paddingHorizontal:16, paddingVertical:10, backgroundColor:'#6B4FE3', borderRadius:10 }}>
          <Text style={{ color:'#fff', fontWeight:'600' }}>Start New Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <View />;
}
