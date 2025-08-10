
import React from 'react';
import { View, Text } from 'react-native';
export default function EmptyState({ title, subtitle }:{ title:string; subtitle?:string }) {
  return (
    <View style={{ alignItems:'center', marginTop:40 }}>
      <Text style={{ fontSize:16, fontWeight:'800', color:'#111' }}>{title}</Text>
      {subtitle ? <Text style={{ color:'#666', marginTop:6 }}>{subtitle}</Text> : null}
    </View>
  );
}
