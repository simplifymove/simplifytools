// app/api/admin/audit/artifacts/[id]/route.ts
// Get and delete specific artifacts

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { getArtifactById, deleteArtifact, downloadArtifact } from '@/lib/services/artifact';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { response } = await requireAdminApi();
    if (response) return response;

    const artifact = await getArtifactById(id);

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    // Check if requesting file content
    if (request.nextUrl.searchParams.get('download') === 'true') {
      const fileData = await downloadArtifact(id);
      if (!fileData) {
        return NextResponse.json({ error: 'Failed to download' }, { status: 500 });
      }

      return new NextResponse(new Uint8Array(fileData), {
        headers: {
          'Content-Type': artifact.mimeType,
          'Content-Disposition': `attachment; filename="${id}"`,
        },
      });
    }

    return NextResponse.json(artifact);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/artifacts/[id]');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { response } = await requireAdminApi();
    if (response) return response;

    const success = await deleteArtifact(id);

    if (!success) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.error({ error }, 'DELETE /api/admin/audit/artifacts/[id]');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
