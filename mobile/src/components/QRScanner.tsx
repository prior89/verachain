
import React, { useEffect, useState } from 'react';
import { View, Text, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarcodeScanningResult } from 'expo-camera/build/Camera.types';

interface Props {
  mode: 'product' | 'certificate';
  onScanned: (content: string) => void;
}

export default function QRScanner({ mode, onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => { if (!permission?.granted) requestPermission(); }, [permission]);

  if (!permission) return <View />;
  if (!permission.granted) return <Text>Camera permission is required.</Text>;

  const handleScan = (res: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(30);
    onScanned(res.data);
    setTimeout(() => setScanned(false), 700);
  };

  return (
    <View style={{ flex:1 }}>
      <CameraView
        style={{ flex:1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
        onBarcodeScanned={handleScan}
      />
      <View style={{ position:'absolute', bottom:20, alignSelf:'center', backgroundColor:'#00000090', paddingHorizontal:14, paddingVertical:8, borderRadius:12 }}>
        <Text style={{ color:'#fff' }}>{mode === 'product' ? 'Align product label/serial in frame' : 'Align certificate / QR in frame'}</Text>
      </View>
    </View>
  );
}
