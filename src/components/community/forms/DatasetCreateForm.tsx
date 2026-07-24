import React, { useState } from 'react';
import { useCommunityStore } from '../../../store/useCommunityStore';
import api from '../../../lib/axios';

export default function DatasetCreateForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [license, setLicense] = useState('');
  const [format, setFormat] = useState('');
  const [imageType, setImageType] = useState('');
  const [resolution, setResolution] = useState('');
  const [classes, setClasses] = useState('');
  const [usageExample, setUsageExample] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { fetchDatasetList } = useCommunityStore();

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
    if (!title.trim() || !description.trim() || !selectedFile) {
      alert('제목, 설명, 그리고 업로드할 파일을 반드시 지정해야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload File
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
      
      const fileId = uploadedFiles[0].fileId;

      // 2. Create Dataset
      await api.post('/community/datasets', {
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
        fileId
      });

      alert('데이터셋이 성공적으로 업로드되었습니다!');
      fetchDatasetList();
      onClose();
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }, message?: string };
      alert('업로드에 실패했습니다: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-gray-900 mb-2">데이터셋 기여하기</h3>
      <p className="text-gray-500 mb-8 font-medium">고품질 데이터셋을 업로드하고 연구 커뮤니티에 기여하세요.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">데이터셋 제목 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: Chest X-Ray Images (Pneumonia)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: Medical Imaging"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">데이터셋 설명 <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-32 resize-none"
            placeholder="데이터셋에 대한 상세한 설명을 적어주세요."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">라이선스</label>
            <input type="text" value={license} onChange={(e) => setLicense(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: CC BY 4.0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">포맷</label>
            <input type="text" value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: JPEG, CSV" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이미지 종류</label>
            <input type="text" value={imageType} onChange={(e) => setImageType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: X-Ray, MRI" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">해상도 / 규격</label>
            <input type="text" value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: 1024x1024" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">클래스 정보</label>
            <input type="text" value={classes} onChange={(e) => setClasses(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: Normal(200), Pneumonia(400)" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">사용 예시 (선택)</label>
          <input type="text" value={usageExample} onChange={(e) => setUsageExample(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" placeholder="예: PyTorch DataLoader 예제 코드 등" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">태그 (엔터로 추가)</label>
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-13">
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
          <label className="block text-sm font-bold text-gray-700 mb-2">데이터 파일 첨부 <span className="text-red-500">*</span></label>
          <input 
            type="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" 
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || !selectedFile}
            className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? '업로드 중...' : '데이터셋 업로드'}
          </button>
        </div>
      </form>
    </div>
  );
}
