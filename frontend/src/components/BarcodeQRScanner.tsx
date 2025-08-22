// src/components/UniversalScanner.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
  type IBrowserCodeReaderOptions,
} from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

type Props = {
  onResult: (text: string) => void;
  onError?: (err: unknown) => void;
  continuous?: boolean;
  preferredFacingMode?: "environment" | "user";
  width?: number;
  height?: number;
  formats?: BarcodeFormat[];
  scanIntervalMs?: number; // khoảng cách giữa 2 lần decode
  showControls?: boolean;
};

const DEFAULT_FORMATS: BarcodeFormat[] = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.AZTEC,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.ITF,
  BarcodeFormat.UPC_E,
];

function pickDeviceId(
  devices: MediaDeviceInfo[],
  preferred: "environment" | "user"
): string | undefined {
  if (!devices?.length) return undefined;
  if (preferred === "environment") {
    const back = devices.find((d) => /back|rear|environment/i.test(d.label || ""));
    if (back) return back.deviceId;
  } else {
    const front = devices.find((d) => /front|user/i.test(d.label || ""));
    if (front) return front.deviceId;
  }
  return devices[devices.length - 1]?.deviceId;
}

export default function Scanner({
  onResult,
  onError,
  continuous = true,
  preferredFacingMode = "environment",
  width = 360,
  height = 270,
  formats,
  scanIntervalMs = 150,
  showControls = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [torchOn, setTorchOn] = useState(false);

  const allowedFormats = useMemo(
    () => (formats?.length ? formats : DEFAULT_FORMATS),
    [formats]
  );

  // B1: liệt kê camera
  useEffect(() => {
    (async () => {
      try {
        let list = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!list.length || !list[0]?.label) {
          // xin quyền để có label, rồi liệt kê lại
          await navigator.mediaDevices.getUserMedia({ video: true });
          list = await BrowserMultiFormatReader.listVideoInputDevices();
        }
        setDevices(list);
        setSelectedDeviceId(pickDeviceId(list, preferredFacingMode));
      } catch (e) {
        onError?.(e);
      }
    })();
  }, [preferredFacingMode, onError]);

  // B2: khởi động scanner
  useEffect(() => {
    if (!videoRef.current) return;

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, allowedFormats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const options: IBrowserCodeReaderOptions = {
      delayBetweenScanAttempts: scanIntervalMs, // ✅ đúng type
      // delayBetweenScanSuccess: 300, // (tuỳ chọn) nghỉ ngắn sau khi decode thành công
    };

    const reader = new BrowserMultiFormatReader(hints, options);
    let stopped = false;

    (async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(
          selectedDeviceId, // undefined = auto-pick
          videoRef.current!,
          (result, err) => {
            if (stopped) return;
            if (result) {
              navigator.vibrate?.(80);
              onResult(result.getText());
              if (!continuous) controlsRef.current?.stop();
            } else if (err) {
              const name = (err as any)?.name;
              // NotFoundException xảy ra liên tục khi chưa thấy mã — bỏ qua cho đỡ ồn
              if (name && name !== "NotFoundException") onError?.(err);
            }
          }
        );
        controlsRef.current = controls;
      } catch (e) {
        onError?.(e);
      }
    })();

    return () => {
      stopped = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [selectedDeviceId, allowedFormats, scanIntervalMs, continuous, onResult, onError]);

  // Torch (đèn pin) — cần cast any vì TS DOM chưa có 'torch' trong type
  const toggleTorch = async () => {
    const track =
      videoRef.current?.srcObject instanceof MediaStream
        ? videoRef.current.srcObject.getVideoTracks?.()[0]
        : undefined;

    try {
      const caps: any = track?.getCapabilities?.();
      if (caps?.torch) {
        const newVal = !torchOn;
        await (track as any)?.applyConstraints?.({
          advanced: [{ torch: newVal } as any],
        } as any);
        setTorchOn(newVal);
      } else {
        onError?.(new Error("Camera không hỗ trợ torch/flash"));
      }
    } catch (e) {
      onError?.(e);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {showControls && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value || undefined)}
            style={{ padding: 6 }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId.slice(0, 6)}…`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleTorch}
            style={{ padding: "6px 10px", borderRadius: 6 }}
          >
            {torchOn ? "Tắt đèn" : "Bật đèn"}
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        style={{ width, height, objectFit: "cover", borderRadius: 8, background: "#000" }}
        muted
        playsInline
        autoPlay
      />
    </div>
  );
}
