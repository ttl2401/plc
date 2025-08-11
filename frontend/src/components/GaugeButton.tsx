import React, { useState } from "react";
import { PoweroffOutlined } from "@ant-design/icons";

interface GaugeButtonProps {
  checked?: boolean;        // "#22c55e", "#ef4444"
  label: string;
  value: string;
  leftLabel?: string;
  rightLabel?: string;
  onChange?: (newValue: boolean) => void | Promise<void>;
}

const GaugeButton: React.FC<GaugeButtonProps> = ({
  checked: checkedProp,
  label,
  value,
  leftLabel,
  rightLabel,
  onChange,
}) => {
  // Gauge parameters
  const size = 100;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const startAngle = 180; // degrees
  const endAngle = 360;   // degrees
  const angle = 270;

  const colorList = [
    "#22c55e","#ef4444"
  ]
  const [checked, setChecked] = useState(!!checkedProp);
  
  // Sync with prop changes
  React.useEffect(() => {
    setChecked(!!checkedProp);
  }, [checkedProp]);

  // Utility: degree to radian
  const deg2rad = (deg: number) => (Math.PI * deg) / 180;

  // Arc path for active
  const describeArc = (start: number, end: number) => {
    const r = radius;
    const x1 = size/2 + r * Math.cos(deg2rad(start));
    const y1 = size/2 + r * Math.sin(deg2rad(start));
    const x2 = size/2 + r * Math.cos(deg2rad(end));
    const y2 = size/2 + r * Math.sin(deg2rad(end));
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const activeArcValue = checked ? describeArc(startAngle, angle) : describeArc(angle, endAngle);
  const color = colorList[checked ? 0 : 1];
  const valueColor = colorList[checked ? 0 : 1];
  // Kim chỉ

  const pointerAngle = checked ? -135 : -45;
  const pointerLength = radius - 10;
  const pointerX = size/2 + pointerLength * Math.cos(deg2rad(pointerAngle));
  const pointerY = size/2 + pointerLength * Math.sin(deg2rad(pointerAngle));

  const leftStyle = {
    color: checked ? "#22c55e" : "#9ca3af",
    fontWeight: 600,
    fontSize: 16,
    marginRight: 8,
    minWidth: 32,
    textAlign: "right" as const
  };
  const rightStyle = {
    color: !checked ? "#ef4444" : "#9ca3af",
    fontWeight: 600,
    fontSize: 16,
    marginLeft: 8,
    minWidth: 32,
    textAlign: "left" as const
  };
  
  const handleClick = async () => {
    const newValue = !checked;
    setChecked(newValue);
    
    if (onChange) {
      try {
        await onChange(newValue);
      } catch (error) {
        // Revert state if onChange fails
        setChecked(!newValue);
        console.error('GaugeButton onChange error:', error);
      }
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background Arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            stroke="#eee"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
          {/* Active Arc */}
          <path
            d={activeArcValue}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
          {/* Pointer */}
          <line
            x1={size/2}
            y1={size/2}
            x2={pointerX}
            y2={pointerY}
            stroke="#222"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
        {/* Button Power icon */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 40,
            height: 40,
            background: color,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            cursor: "pointer"
          }}
          onClick={handleClick}
        >
          <PoweroffOutlined style={{ color: "#fff", fontSize: 22 }} />
        </div>
      </div>
      {/* Value và Label trái/phải */}
      <div style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        width: "90%",
        justifyContent: "center"
      }}>
        {leftLabel && <span style={leftStyle}>{leftLabel}</span>}
        <span style={{
          minWidth: 30
        }}>&nbsp;</span>
        {rightLabel && <span style={rightStyle}>{rightLabel}</span>}
      </div>
    </div>
  );
};

export default GaugeButton;
