import React, { useState } from 'react';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { useAssetStore } from '../../../store/useAssetStore';
import api from '../../../lib/axios';

interface DatasetInitialData {
  datasetId?: number | string;
  id?: number | string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  license?: string;
  format?: string;
  imageType?: string;
  resolution?: string;
  classes?: string;
  usageExample?: string;
  tags?: string[];
}

interface DatasetCreateFormProps {
  onClose: () => void;
  context?: 'COMMUNITY' | 'ASSET' | 'EDIT_ASSET';
  initialData?: DatasetInitialData;
}

export default function DatasetCreateForm({ onClose, context = 'COMMUNITY', initialData }: DatasetCreateFormProps) {
  const [title, setTitle] = useState(initialData?.title || initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [license, setLicense] = useState(initialData?.license || '');
  const [format, setFormat] = useState(initialData?.format || '');
  const [imageType, setImageType] = useState(initialData?.imageType || '');
  const [resolution, setResolution] = useState(initialData?.resolution || '');
  const [classes, setClasses] = useState(initialData?.classes || '');
  const [usageExample, setUsageExample] = useState(initialData?.usageExample || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { fetchDatasetList, updateDataset } = useCommunityStore();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || (!selectedFile && context !== 'EDIT_ASSET')) {
      alert('제목, 설명, 그리고 업로드할 파일을 지정해야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      let fileId: number | undefined = undefined;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('files', selectedFile);

        const uploadRes = await api.post('/files/temp', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedFiles = uploadRes.data.data;
        if (!uploadedFiles || uploadedFiles.length === 0) {
          throw new Error('파일 업로드 응답이 없습니다.');
        }
        
        fileId = uploadedFiles[0].fileId;
      }

      if (context === 'EDIT_ASSET') {
        const datasetId = initialData?.datasetId || initialData?.id;
        if (!datasetId) {
          throw new Error('수정할 데이터셋 ID를 찾을 수 없습니다.');
        }

        await updateDataset(Number(datasetId), {
          title,
          description,
          category: category || undefined,
          license: license || undefined,
          format: format || undefined,
          imageType: imageType || undefined,
          resolution: resolution || undefined,
          classes: classes || undefined,
          usageExample: usageExample || undefined,
          tags,
          fileId,
        });

        try {
          await useAssetStore.getState().fetchMyDatasets('UPLOADED');
        } catch {
          // ignore if not in asset view
        }

        alert('데이터셋이 성공적으로 수정되었습니다!');
        onClose();
        return;
      }

      // 2. Create Dataset with isPublic
      const isPublic = context !== 'ASSET';
      await api.post('/datasets', {
        title,
        description,
        category,
        license,
        format,
        imageType,
        resolution,
        classes,
        usageExample,
        tags,
        fileId: fileId ?? 1,
        isPublic,
      });

      alert(
        isPublic
          ? '데이터셋이 커뮤니티에 성공적으로 등록되었습니다!'
          : '데이터셋이 내 자산에 비공개로 안전하게 저장되었습니다!'
      );
      fetchDatasetList();
      try {
        await useAssetStore.getState().fetchMyDatasets('UPLOADED');
      } catch {
        // ignore
      }
      onClose();
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }, message?: string };
      alert((context === 'EDIT_ASSET' ? '수정에 실패했습니다: ' : '업로드에 실패했습니다: ') + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-foreground mb-2">
        {context === 'EDIT_ASSET' ? '데이터셋 수정하기' : context === 'ASSET' ? '새 데이터셋 추가' : '데이터셋 기여하기'}
      </h3>
      <p className="text-muted-foreground mb-8 font-medium">
        {context === 'EDIT_ASSET'
          ? '업로드한 데이터셋의 정보를 수정하세요.'
          : context === 'ASSET' 
          ? '의료 데이터셋을 내 작업실에 안전하게 비공개로 업로드하세요.' 
          : '고품질 데이터셋을 업로드하고 연구 커뮤니티에 기여하세요.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">데이터셋 제목 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: Chest X-Ray Images (Pneumonia)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: Medical Imaging"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">데이터셋 설명 <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-32 resize-none"
            placeholder="데이터셋에 대한 상세한 설명을 적어주세요."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">라이선스</label>
            <input type="text" value={license} onChange={(e) => setLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: CC BY 4.0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">포맷</label>
            <input type="text" value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: JPEG, CSV" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">이미지 종류</label>
            <input type="text" value={imageType} onChange={(e) => setImageType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: X-Ray, MRI" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">해상도 / 규격</label>
            <input type="text" value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: 1024x1024" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">클래스 정보</label>
            <input type="text" value={classes} onChange={(e) => setClasses(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: Normal(200), Pneumonia(400)" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2 flex items-center justify-between">
            <span>사용 예시 / 파이썬 코드 (선택)</span>
            <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-1 rounded-md">Markdown 지원</span>
          </label>
          <textarea 
            value={usageExample} 
            onChange={(e) => setUsageExample(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm bg-muted h-32" 
            placeholder={"```python\nimport biffusion\ndataset = biffusion.load_dataset('...')\n```"} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">태그 (엔터로 추가)</label>
          <div className="w-full px-4 py-3 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-13">
            {tags.map(item => (
              <span key={item} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                {item}
                <button type="button" onClick={() => handleRemoveTag(item)} className="hover:text-primary/70">&times;</button>
              </span>
            ))}
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="flex-1 min-w-30 outline-none font-medium text-sm bg-transparent" placeholder={tags.length === 0 ? "예: X-Ray" : ""} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            데이터 파일 첨부 {context !== 'EDIT_ASSET' && <span className="text-red-500">*</span>}
            {context === 'EDIT_ASSET' && (
              <span className="text-xs text-muted-foreground font-normal ml-2">
                (파일을 새로 변경할 때만 선택해주세요)
              </span>
            )}
          </label>
          <input 
            type="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" 
            required={context !== 'EDIT_ASSET'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-muted-foreground hover:bg-muted font-bold transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? '진행 중...' : (context === 'EDIT_ASSET' ? '수정 완료' : '업로드')}
          </button>
        </div>
      </form>
    </div>
  );
}
