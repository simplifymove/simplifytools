'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp, BarChart3 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

type ChartType = 'bar' | 'line' | 'pie';

interface DataPoint {
  label: string;
  value: number;
}

export default function ChartMakerPage() {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('My Chart');
  const [data, setData] = useState<DataPoint[]>([
    { label: 'January', value: 65 },
    { label: 'February', value: 59 },
    { label: 'March', value: 80 },
    { label: 'April', value: 81 },
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const addDataPoint = () => {
    if (newLabel && newValue) {
      setData([...data, { label: newLabel, value: parseFloat(newValue) }]);
      setNewLabel('');
      setNewValue('');
    }
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: 'label' | 'value', val: string) => {
    const newData = [...data];
    if (field === 'label') {
      newData[index].label = val;
    } else {
      newData[index].value = parseFloat(val) || 0;
    }
    setData(newData);
  };

  const downloadChart = () => {
    const canvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const drawChart = (ctx: CanvasRenderingContext2D) => {
    const width = 600;
    const height = 400;
    const padding = 60;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 30);

    if (chartType === 'bar') {
      drawBarChart(ctx, width, height, padding);
    } else if (chartType === 'line') {
      drawLineChart(ctx, width, height, padding);
    } else if (chartType === 'pie') {
      drawPieChart(ctx, width, height);
    }
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const dataPoints = data;
    const maxValue = Math.max(...dataPoints.map(d => d.value));
    const barWidth = (width - padding * 2) / dataPoints.length;
    const chartHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw bars
    dataPoints.forEach((point, i) => {
      const barHeight = (point.value / maxValue) * chartHeight;
      const x = padding + i * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;

      ctx.fillStyle = `hsl(${(i * 360) / dataPoints.length}, 70%, 60%)`;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);

      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x + barWidth * 0.4, height - padding + 20);

      // Draw value
      ctx.fillText(point.value.toString(), x + barWidth * 0.4, y - 5);
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const dataPoints = data;
    const maxValue = Math.max(...dataPoints.map(d => d.value));
    const pointSpacing = (width - padding * 2) / (dataPoints.length - 1 || 1);
    const chartHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    dataPoints.forEach((point, i) => {
      const x = padding + i * pointSpacing;
      const y = height - padding - (point.value / maxValue) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    dataPoints.forEach((point, i) => {
      const x = padding + i * pointSpacing;
      const y = height - padding - (point.value / maxValue) * chartHeight;

      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw label and value
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, height - padding + 20);
      ctx.fillText(point.value.toString(), x, y - 15);
    });
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = 100;

    let currentAngle = 0;
    data.forEach((point, i) => {
      const sliceAngle = (point.value / total) * Math.PI * 2;
      
      ctx.fillStyle = `hsl(${(i * 360) / data.length}, 70%, 60%)`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, labelX, labelY);

      currentAngle += sliceAngle;
    });
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Chart Maker</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <BarChart3 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Chart Maker</h1>
                <p className="text-lg text-white/90">Create beautiful data visualizations with bar, line, and pie charts instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Preview - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Chart Preview</h2>
                  <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                    <canvas
                      id="chart-canvas"
                      width={600}
                      height={400}
                      ref={(canvas) => {
                        if (canvas && data.length > 0) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) drawChart(ctx);
                        }
                      }}
                      className="border border-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Chart Title */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Chart Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter chart title"
                    />
                  </div>

                  {/* Chart Type */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Chart Type
                    </label>
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as ChartType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                    </select>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={downloadChart}
                    className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Chart
                  </button>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Multiple chart types</li>
                      <li>• Custom data input</li>
                      <li>• Instant preview</li>
                      <li>• Download as PNG</li>
                      <li>• Professional design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Input Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Points</h2>
              
              <div className="space-y-4">
                {data.map((point, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Label</label>
                      <input
                        type="text"
                        value={point.label}
                        onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">Value</label>
                      <input
                        type="number"
                        value={point.value}
                        onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      onClick={() => removeDataPoint(index)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Data Point */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Data Point</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={addDataPoint}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}







