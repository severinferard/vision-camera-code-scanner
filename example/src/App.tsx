import * as React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import {
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import {
  BarcodeFormat,
  scanBarcodes,
  Barcode,
  ScanFrame,
} from 'vision-camera-code-scanner';

const MARKER_WIDTH_RATIO = 0.4;

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const [barcodes, setBarcodes] = React.useState<Barcode[]>([]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const squareSize = frame.width * MARKER_WIDTH_RATIO - 100;

    const scanFrame: ScanFrame = {
      width: squareSize,
      height: squareSize,
      x: (frame.width - squareSize) / 2,
      y: (frame.height - squareSize) / 2,
    };
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE], {
      checkInverted: true,
      scanFrame: scanFrame,
    });
    runOnJS(setBarcodes)(detectedBarcodes);
  }, []);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  React.useEffect(() => {
    console.log(barcodes);
  }, [barcodes]);

  return (
    device != null &&
    hasPermission && (
      <>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        {barcodes.map((barcode, idx) => (
          <Text key={idx} style={styles.barcodeTextURL}>
            {barcode.displayValue}
          </Text>
        ))}
        <View style={styles.container}>
          <View
            style={[
              styles.marker,
              barcodes.length ? styles.markerActive : {},
              { width: `${MARKER_WIDTH_RATIO * 100}%` },
            ]}
          ></View>
        </View>
      </>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  markerActive: {
    borderColor: '#ff0000',
  },
  marker: {
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 20,
    aspectRatio: 1,
  },
});
