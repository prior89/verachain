
import React from 'react';
import { View, Text } from 'react-native';

export default function ProfileScreen() {
  const user = { name:'Dohoon', wallet:'0xYourWallet', email:'you@example.com' };
  return (
    <View style={{ flex:1, padding:16, backgroundColor:'#fff' }}>
      <View style={{ padding:16, borderWidth:1, borderColor:'#eee', borderRadius:16, backgroundColor:'#fafafa' }}>
        <Text style={{ fontSize:18, fontWeight:'800', color:'#111' }}>{user.name}</Text>
        <Text style={{ marginTop:8, color:'#222' }}>Wallet: {user.wallet}</Text>
        <Text style={{ color:'#222' }}>Email: {user.email}</Text>
      </View>
    </View>
  );
}
