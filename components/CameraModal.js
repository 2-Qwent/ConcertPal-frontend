import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function CameraModal({ onClose, onPicture }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      onPicture(photo);
      console.log(photo)
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <CameraView
          style={{ flex: 1, width: "100%" }}
          facing={facing}
          ref={cameraRef}
        >
          <TouchableOpacity>
            <FontAwesome
              name="camera"
              size={70}
              color="white"
              onPress={takePicture}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraFacing}>
            <FontAwesome name="rotate-right" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome
            name="close"
            size={30}
            color="white" />
          </TouchableOpacity>
        </CameraView>
      </View>
    </Modal>
  );
}
