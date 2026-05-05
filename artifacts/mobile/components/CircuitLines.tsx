import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");
const LINE_COLOR = "#0E3354";
const DOT_COLOR = "#1A5F8A";

function HLine({ top, left, w }: { top: number; left: number; w: number }) {
  return (
    <View
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: 1,
        backgroundColor: LINE_COLOR,
      }}
    />
  );
}

function VLine({ top, left, h }: { top: number; left: number; h: number }) {
  return (
    <View
      style={{
        position: "absolute",
        top,
        left,
        width: 1,
        height: h,
        backgroundColor: LINE_COLOR,
      }}
    />
  );
}

function Dot({ top, left }: { top: number; left: number }) {
  return (
    <View
      style={{
        position: "absolute",
        top: top - 3,
        left: left - 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: DOT_COLOR,
      }}
    />
  );
}

export function CircuitLines() {
  return (
    <View style={styles.container}>
      {/* Left side traces */}
      <HLine top={SH * 0.18} left={0} w={SW * 0.08} />
      <VLine top={SH * 0.18} left={SW * 0.08} h={SH * 0.12} />
      <Dot top={SH * 0.18} left={SW * 0.08} />
      <HLine top={SH * 0.30} left={SW * 0.08} w={SW * 0.06} />
      <Dot top={SH * 0.30} left={SW * 0.14} />

      <HLine top={SH * 0.52} left={0} w={SW * 0.06} />
      <VLine top={SH * 0.52} left={SW * 0.06} h={SH * 0.08} />
      <Dot top={SH * 0.60} left={SW * 0.06} />

      <HLine top={SH * 0.72} left={0} w={SW * 0.1} />
      <Dot top={SH * 0.72} left={SW * 0.1} />

      {/* Right side traces */}
      <HLine top={SH * 0.22} left={SW * 0.92} w={SW * 0.08} />
      <VLine top={SH * 0.22} left={SW * 0.92} h={SH * 0.1} />
      <Dot top={SH * 0.22} left={SW * 0.92} />

      <HLine top={SH * 0.45} left={SW * 0.88} w={SW * 0.12} />
      <VLine top={SH * 0.38} left={SW * 0.88} h={SH * 0.07} />
      <Dot top={SH * 0.38} left={SW * 0.88} />

      <HLine top={SH * 0.65} left={SW * 0.9} w={SW * 0.1} />
      <Dot top={SH * 0.65} left={SW * 0.9} />

      {/* Top traces */}
      <VLine top={0} left={SW * 0.25} h={SH * 0.06} />
      <HLine top={SH * 0.06} left={SW * 0.25} w={SW * 0.08} />
      <Dot top={SH * 0.06} left={SW * 0.33} />

      <VLine top={0} left={SW * 0.75} h={SH * 0.05} />
      <HLine top={SH * 0.05} left={SW * 0.7} w={SW * 0.05} />
      <Dot top={SH * 0.05} left={SW * 0.7} />

      {/* Bottom traces */}
      <VLine top={SH * 0.92} left={SW * 0.3} h={SH * 0.08} />
      <Dot top={SH * 0.92} left={SW * 0.3} />

      <VLine top={SH * 0.88} left={SW * 0.7} h={SH * 0.12} />
      <HLine top={SH * 0.88} left={SW * 0.65} w={SW * 0.05} />
      <Dot top={SH * 0.88} left={SW * 0.65} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none" as const,
  },
});
