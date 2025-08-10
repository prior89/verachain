
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'space-between', paddingTop:48, paddingBottom:28, backgroundColor:'#fff' }}>
      <View style={{ alignItems:'center', paddingHorizontal:24 }}>
        <Image source={{ uri:'https://placehold.co/300x220/6B4FE3/FFFFFF?text=VeraChain' }} style={{ width:300, height:220, borderRadius:16 }} />
        <Text style={{ marginTop:16, fontSize:18, textAlign:'center', color:'#222' }}>
          Verify products with dual-factor certification. Simple. Secure. On-chain.
        </Text>
      </View>
      <TouchableOpacity onPress={() => nav.navigate('Scan' as never)} style={{ backgroundColor:'#6B4FE3', paddingHorizontal:20, paddingVertical:14, borderRadius:14 }}>
        <Text style={{ color:'#fff', fontSize:16, fontWeight:'700' }}>Start Scan</Text>
      </TouchableOpacity>
    </View>
  );
}
