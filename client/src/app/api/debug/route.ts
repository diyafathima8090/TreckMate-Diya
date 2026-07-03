import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const output = execSync('node test-server.js', { cwd: 'c:\\\\Users\\\\thasn\\\\OneDrive\\\\Desktop\\\\Trekmate\\\\server', encoding: 'utf-8' });
    return NextResponse.json({ success: true, output });
  } catch (error: any) {
    return NextResponse.json({ success: false, output: error.stdout, error: error.stderr || error.message });
  }
}
