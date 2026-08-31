import { createContext, useContext, type PropsWithChildren } from 'react';
import type { StagedMediaAsset } from '../../../shared/api/contracts';
import type { ProjectType } from '../../../shared/content/types';

export type MediaEditorValue = {
  enabled: boolean;
  projectType: ProjectType;
  projectSlug: string;
  onStaged: (assets: StagedMediaAsset[]) => void;
};

const MediaEditorContext = createContext<MediaEditorValue | null>(null);

export function MediaEditorProvider({ value, children }: PropsWithChildren<{ value: MediaEditorValue }>) {
  return <MediaEditorContext.Provider value={value}>{children}</MediaEditorContext.Provider>;
}

export function useMediaEditor(): MediaEditorValue | null {
  return useContext(MediaEditorContext);
}
