import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Users, Folder, Trash2, Edit, X, ArrowLeft, MessageSquare, Type, Star } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('lessons'); // lessons, categories, users, questions-view
    const [data, setData] = useState([]);

    // For Questions View
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [questionsData, setQuestionsData] = useState([]);

    // For Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    // Modal 6: Lesson Detail
    const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
    const [selectedLessonDetail, setSelectedLessonDetail] = useState(null);
    // Modal 7: User Detail
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    // Modal 7.5: Feedback Detail
    const [showFeedbackDetailModal, setShowFeedbackDetailModal] = useState(false);
    const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState(null);
    // Modal 8: Confirm Delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, isQuestion }
    const [formData, setFormData] = useState({});

    // For Lesson creation/editing, we need category options
    const [categories, setCategories] = useState([]);
    // Kho bài học (để chọn khi quản lý từ vựng)
    const [allLessons, setAllLessons] = useState([]);

    const fetchData = async () => {
        try {
            if (activeTab === 'questions-view') return; // Handled separately
            let endpoint = '';
            if (activeTab === 'lessons') endpoint = '/lessons?admin=true';
            if (activeTab === 'categories') endpoint = '/categories';
            if (activeTab === 'users') endpoint = '/auth/users';
            if (activeTab === 'vocabularies') endpoint = '/vocabulary';
            if (activeTab === 'feedbacks') endpoint = '/feedback';
            if (activeTab === 'achievements') endpoint = '/gamification/achievements';

            const res = await api.get(endpoint);
            let resultData = res.data.data || res.data;

            // Sort lessons by Level (Thấp -> Trung -> Cao)
            if (activeTab === 'lessons' && Array.isArray(resultData)) {
                const levelOrder = { 'Thấp': 0, 'Trung': 1, 'Cao': 2 };
                resultData.sort((a, b) => (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0));
            }

            setData(resultData);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh mục', err);
        }
    };

    const fetchAllLessons = async () => {
        try {
            const res = await api.get('/lessons?admin=true');
            if (res.data.success) {
                setAllLessons(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi khi tải bài học', err);
        }
    };

    const fetchQuestions = async (lessonId) => {
        try {
            const res = await api.get(`/lessons/${lessonId}`);
            if (res.data.success) {
                setQuestionsData(res.data.data.questions || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải câu hỏi', err);
        }
    };

    useEffect(() => {
        if (activeTab !== 'questions-view') {
            fetchData();
        }
        if (activeTab === 'lessons') fetchCategories();
        if (activeTab === 'vocabularies' && allLessons.length === 0) fetchAllLessons();
        if (activeTab === 'questions-view' && selectedLesson) {
            fetchQuestions(selectedLesson._id);
        }
    }, [activeTab, selectedLesson]);

    const handleDelete = async (id, isQuestion = false, name = '') => {
        // Show confirm modal instead of window.confirm
        setDeleteTarget({ id, isQuestion, name });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, isQuestion } = deleteTarget;
        try {
            if (isQuestion) {
                await api.delete(`/questions/${id}`);
                fetchQuestions(selectedLesson._id);
            } else {
                let endpoint = '';
                if (activeTab === 'lessons') endpoint = `/lessons/${id}`;
                if (activeTab === 'categories') endpoint = `/categories/${id}`;
                if (activeTab === 'users') endpoint = `/auth/users/${id}`;
                if (activeTab === 'vocabularies') endpoint = `/vocabulary/${id}`;
                if (activeTab === 'feedbacks') endpoint = `/feedback/${id}`;
                if (activeTab === 'achievements') endpoint = `/gamification/achievements/${id}`;
                await api.delete(endpoint);
                fetchData();
            }
            setShowDeleteModal(false);
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            // Edit modes
            if (mode === 'edit-question') {
                setFormData({
                    ...item,
                    options: item.options ? item.options.join(',') : '' // Convert array back to string for edit
                });
            } else {
                setFormData(item);
            }
        } else {
            // Create modes
            if (activeTab === 'lessons') {
                setFormData({ title: '', description: '', level: 'Thấp', categoryId: categories.length > 0 ? categories[0]._id : '', xpAwarded: 10, isActive: true });
            } else if (activeTab === 'categories') {
                setFormData({ name: 'Reading', description: '', order: 1 });
            } else if (activeTab === 'questions-view') {
                setFormData({
                    type: 'Trắc nghiệm',
                    level: 'Thấp',
                    question: '',
                    options: '',
                    correctAnswer: '',
                    explanation: ''
                });
            } else if (activeTab === 'users') {
                setFormData({});
            } else if (activeTab === 'vocabularies') {
                setFormData({ word: '', meaning: '', pronunciation: '', example: '', lessonId: allLessons.length > 0 ? allLessons[0]._id : '', questionId: '' });
            }
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let payload = { ...formData };
            let endpoint = '';

            // Special handling for Questions
            if (activeTab === 'questions-view' || modalMode.includes('question')) {
                // Convert options string back to array if applicable
                if (payload.type === 'Trắc nghiệm' || payload.type === 'Sắp xếp câu' || payload.type === 'Đúng/Sai') {
                    if (typeof payload.options === 'string') {
                        payload.options = payload.options.split(',').map(s => s.trim()).filter(s => s !== '');
                    }
                }

                payload.lessonId = selectedLesson._id;

                if (modalMode === 'create-question') {
                    await api.post('/questions', payload);
                } else if (modalMode === 'edit-question') {
                    await api.put(`/questions/${payload._id}`, payload);
                }
                fetchQuestions(selectedLesson._id);

            } else {
                // Regular Save logic
                if (activeTab === 'lessons') {
                    endpoint = modalMode === 'create' ? '/lessons' : `/lessons/${formData._id}`;
                    if (payload.categoryId && typeof payload.categoryId === 'object') {
                        payload.categoryId = payload.categoryId._id;
                    }
                } else if (activeTab === 'categories') {
                    endpoint = modalMode === 'create' ? '/categories' : `/categories/${formData._id}`;
                } else if (activeTab === 'users') {
                    endpoint = `/auth/users/${formData._id}`;
                } else if (activeTab === 'vocabularies') {
                    endpoint = modalMode === 'create' ? '/vocabulary' : `/vocabulary/${formData._id}`;
                    if (!payload.questionId) delete payload.questionId;
                } else if (activeTab === 'achievements') {
                    endpoint = modalMode === 'create' ? '/achievements' : `/achievements/${formData._id}`;
                }

                if (modalMode === 'create') {
                    if (activeTab === 'achievements') {
                        await api.post('/gamification/achievements', payload);
                    } else {
                        await api.post(endpoint, payload);
                    }
                } else {
                    if (activeTab === 'achievements') {
                        await api.put(`/gamification/achievements/${formData._id}`, payload);
                    } else {
                        await api.put(endpoint, payload);
                    }
                }
                fetchData();
            }

            handleCloseModal();
            alert(modalMode.includes('create') ? 'Tạo mới thành công' : 'Cập nhật thành công');
        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleViewQuestions = (lesson) => {
        setSelectedLesson(lesson);
        setActiveTab('questions-view');
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', backgroundColor: '#f9fafb' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: '2px 0 10px rgba(0,0,0,0.02)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>Cổng Quản Trị</h2>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => { setActiveTab('lessons'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: (activeTab === 'lessons' || activeTab === 'questions-view') ? '#eff6ff' : 'transparent', color: (activeTab === 'lessons' || activeTab === 'questions-view') ? '#2563eb' : '#4b5563', fontWeight: (activeTab === 'lessons' || activeTab === 'questions-view') ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <BookOpen size={20} /> Bài học
                    </button>
                    <button
                        onClick={() => { setActiveTab('categories'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'categories' ? '#eff6ff' : 'transparent', color: activeTab === 'categories' ? '#2563eb' : '#4b5563', fontWeight: activeTab === 'categories' ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Folder size={20} /> Danh mục
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'users' ? '#eff6ff' : 'transparent', color: activeTab === 'users' ? '#2563eb' : '#4b5563', fontWeight: activeTab === 'users' ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Users size={20} /> Người dùng
                    </button>
                    <button
                        onClick={() => { setActiveTab('vocabularies'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'vocabularies' ? '#eff6ff' : 'transparent', color: activeTab === 'vocabularies' ? '#2563eb' : '#4b5563', fontWeight: activeTab === 'vocabularies' ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Type size={20} /> Từ vựng
                    </button>
                    <button
                        onClick={() => { setActiveTab('feedbacks'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'feedbacks' ? '#eff6ff' : 'transparent', color: activeTab === 'feedbacks' ? '#2563eb' : '#4b5563', fontWeight: activeTab === 'feedbacks' ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <MessageSquare size={20} /> Góp ý
                    </button>
                    <button
                        onClick={() => { setActiveTab('achievements'); setSelectedLesson(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: activeTab === 'achievements' ? '#eff6ff' : 'transparent', color: activeTab === 'achievements' ? '#2563eb' : '#4b5563', fontWeight: activeTab === 'achievements' ? '600' : '500', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Star size={20} /> Thành tích
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        {activeTab === 'questions-view' && (
                            <button onClick={() => { setActiveTab('lessons'); setSelectedLesson(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}>
                                <ArrowLeft size={16} /> Quay lại danh sách
                            </button>
                        )}
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
                            {activeTab === 'lessons' && 'Quản lý Bài học'}
                            {activeTab === 'categories' && 'Quản lý Danh mục'}
                            {activeTab === 'users' && 'Quản lý Người dùng'}
                            {activeTab === 'vocabularies' && 'Quản lý Từ vựng'}
                            {activeTab === 'feedbacks' && 'Quản lý Góp ý'}
                            {activeTab === 'questions-view' && `Câu hỏi trong: ${selectedLesson?.title}`}
                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                            {activeTab === 'questions-view' ? `Tổng cộng có ${questionsData.length} câu hỏi` : `Tổng cộng có ${data.length} bản ghi trong dữ liệu`}
                        </p>
                    </div>
                    {activeTab !== 'users' && activeTab !== 'feedbacks' && (
                        <button onClick={() => handleOpenModal(activeTab === 'questions-view' ? 'create-question' : 'create')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                            + Thêm mới
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>

                    {/* QUESTIONS VIEW TABLE */}
                    {activeTab === 'questions-view' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', width: '15%' }}>Thể loại</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', width: '40%' }}>Nội dung câu hỏi</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', width: '25%' }}>Đáp án</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionsData && questionsData.length > 0 ? questionsData.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{item.question}</td>
                                        <td style={{ padding: '1rem', color: '#10b981', fontWeight: '600' }}>{item.correctAnswer}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal('edit-question', item)} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id, true)} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Chưa có câu hỏi nào. Bạn hãy bấm "Thêm mới" để tạo câu hỏi cho bài học này.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* MAIN TABLES (LESSONS, CATEGORIES, USERS) */}
                    {activeTab !== 'questions-view' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    {activeTab === 'lessons' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Tiêu đề</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Level</th>
                                        </>
                                    )}
                                    {activeTab === 'categories' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Tên</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Mô tả</th>
                                        </>
                                    )}
                                    {activeTab === 'users' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Họ Tên / Email</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Level</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>XP / Streak</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Vai trò</th>
                                        </>
                                    )}
                                    {activeTab === 'vocabularies' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Từ Vựng</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Nghĩa</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Thuộc Bài học</th>
                                        </>
                                    )}
                                    {activeTab === 'feedbacks' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Người gửi</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Loại & Tiêu đề</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Trạng thái</th>
                                        </>
                                    )}
                                    {activeTab === 'achievements' && (
                                        <>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Icon</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Tên thành tích</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Mô tả</th>
                                        </>
                                    )}
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.length > 0 ? data.map((item) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        {activeTab === 'lessons' && (
                                            <>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{item.title}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        backgroundColor: item.level === 'Cao' ? '#fee2e2' : (item.level === 'Trung' ? '#fef3c7' : '#d1fae5'),
                                                        color: item.level === 'Cao' ? '#ef4444' : (item.level === 'Trung' ? '#d97706' : '#10b981'),
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.level}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'categories' && (
                                            <>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                                                <td style={{ padding: '1rem', color: '#6b7280' }}>{item.description}</td>
                                            </>
                                        )}
                                        {activeTab === 'users' && (
                                            <>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '500', color: '#111827' }}>{item.fullName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        backgroundColor: item.level === 'Cao' ? '#fee2e2' : (item.level === 'Trung' ? '#fef3c7' : '#d1fae5'),
                                                        color: item.level === 'Cao' ? '#ef4444' : (item.level === 'Trung' ? '#d97706' : '#10b981'),
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.level}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ color: '#059669', fontWeight: '600' }}>{item.xp} XP</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>{item.streak || 0} chuỗi</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ backgroundColor: item.role === 'admin' ? '#fee2e2' : '#f3f4f6', color: item.role === 'admin' ? '#ef4444' : '#4b5563', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                        {item.role}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'vocabularies' && (
                                            <>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#2563eb' }}>{item.word}</td>
                                                <td style={{ padding: '1rem' }}>{item.meaning}</td>
                                                <td style={{ padding: '1rem', color: '#6b7280' }}>{item.lessonId?.title || 'Trống'}</td>
                                            </>
                                        )}
                                        {activeTab === 'feedbacks' && (
                                            <>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '500' }}>{item.user?.fullName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.user?.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>{item.type}</div>
                                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <select
                                                        value={item.status}
                                                        onChange={async (e) => {
                                                            try {
                                                                await api.put(`/feedback/${item._id}/status`, { status: e.target.value });
                                                                fetchData();
                                                            } catch (err) {
                                                                alert('Lỗi cập nhật trạng thái');
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            border: '1px solid #d1d5db',
                                                            backgroundColor: item.status === 'Đã giải quyết' ? '#d1fae5' : (item.status === 'Đang xử lý' ? '#fef3c7' : '#f3f4f6'),
                                                            color: item.status === 'Đã giải quyết' ? '#059669' : (item.status === 'Đang xử lý' ? '#d97706' : '#4b5563')
                                                        }}
                                                    >
                                                        <option value="Đang chờ">Đang chờ</option>
                                                        <option value="Đang xử lý">Đang xử lý</option>
                                                        <option value="Đã giải quyết">Đã giải quyết</option>
                                                    </select>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'achievements' && (
                                            <>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                                        <img src={item.icon} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{item.name}</td>
                                                <td style={{ padding: '1rem', color: '#6b7280' }}>{item.description}</td>
                                            </>
                                        )}
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {activeTab === 'lessons' && (
                                                    <>
                                                        <button onClick={() => { setSelectedLessonDetail(item); setShowLessonDetailModal(true); }} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }} title="Xem chi tiết">
                                                            👁️
                                                        </button>
                                                        <button onClick={() => handleViewQuestions(item)} style={{ border: 'none', background: '#f5f3ff', color: '#8b5cf6', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                                                            <MessageSquare size={16} /> Câu hỏi
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'users' && (
                                                    <button onClick={() => { setSelectedUserDetail(item); setShowUserDetailModal(true); }} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Xem chi tiết">
                                                        👁️
                                                    </button>
                                                )}
                                                {activeTab === 'feedbacks' && (
                                                    <button onClick={() => { setSelectedFeedbackDetail(item); setShowFeedbackDetailModal(true); }} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Xem chi tiết">
                                                        👁️
                                                    </button>
                                                )}
                                                {activeTab !== 'feedbacks' && (
                                                    <button onClick={() => handleOpenModal('edit', item)} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item._id, false, item.title || item.name || item.fullName)} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                                            Chưa có dữ liệu nào trong mục này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {modalMode.includes('create') ? 'Thêm Mới' : 'Cập Nhật'} {activeTab === 'lessons' ? 'Bài học' : activeTab === 'categories' ? 'Danh mục' : activeTab === 'questions-view' ? 'Câu hỏi' : activeTab === 'vocabularies' ? 'Từ vựng' : 'Người dùng'}
                        </h2>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activeTab === 'categories' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Tên danh mục</label>
                                        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="Nhập tên danh mục (VD: Grammar, Vocabulary,...)" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Mô tả</label>
                                        <input type="text" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Mô tả kỹ năng" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Thứ tự hiển thị (Order)</label>
                                        <input type="number" name="order" value={formData.order || 1} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </>
                            )}
                            {activeTab === 'achievements' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Tên thành tích</label>
                                        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="Tên thành tích" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Mô tả</label>
                                        <input type="text" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Mô tả thành tích" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Icon URL</label>
                                        <input type="text" name="icon" value={formData.icon || ''} onChange={handleInputChange} placeholder="URL của icon" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </>
                            )}

                            {activeTab === 'lessons' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Tiêu đề</label>
                                        <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Trình độ</label>
                                        <select name="level" value={formData.level || 'Thấp'} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            <option value="Thấp">Thấp</option>
                                            <option value="Trung">Trung</option>
                                            <option value="Cao">Cao</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Danh mục (Category)</label>
                                        <select name="categoryId" value={typeof formData.categoryId === 'object' ? (formData.categoryId?._id || '') : (formData.categoryId || '')} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Mô tả bài học</label>
                                        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} required rows={3} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Điểm XP phần thưởng</label>
                                        <input type="number" name="xpAwarded" value={formData.xpAwarded || 10} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </>
                            )}

                            {activeTab === 'users' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Họ Tên</label>
                                        <input type="text" value={formData.fullName || ''} disabled style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Phân Quyền (Role)</label>
                                        <select name="role" value={formData.role || 'user'} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            <option value="user">User thường</option>
                                            <option value="admin">Quản trị viên (Admin)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {activeTab === 'questions-view' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Loại câu hỏi</label>
                                        <select name="type" value={formData.type || 'Trắc nghiệm'} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            <option value="Trắc nghiệm">Trắc nghiệm</option>
                                            <option value="Điền từ">Điền từ</option>
                                            <option value="Sắp xếp câu">Sắp xếp câu</option>
                                            <option value="Viết luận">Viết luận</option>
                                            <option value="Đọc hiểu">Đọc hiểu</option>
                                            <option value="Đúng/Sai">Đúng / Sai</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Đề bài / Câu hỏi</label>
                                        <textarea name="question" value={formData.question || ''} onChange={handleInputChange} required rows={3} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Các lựa chọn (phân cách bởi dấu phẩy)</label>
                                        <input type="text" name="options" value={formData.options || ''} onChange={handleInputChange} placeholder="VD: Apple, Banana, Orange" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Đáp án đúng</label>
                                        <input type="text" name="correctAnswer" value={formData.correctAnswer || ''} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Giải thích (Tùy chọn)</label>
                                        <textarea name="explanation" value={formData.explanation || ''} onChange={handleInputChange} rows={2} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
                                    </div>
                                </>
                            )}

                            {activeTab === 'vocabularies' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Từ vựng (Tiếng Anh)</label>
                                        <input type="text" name="word" value={formData.word || ''} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Ý nghĩa (Tiếng Việt)</label>
                                        <input type="text" name="meaning" value={formData.meaning || ''} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Phiên âm (Tùy chọn)</label>
                                        <input type="text" name="pronunciation" value={formData.pronunciation || ''} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Ví dụ (Tùy chọn)</label>
                                        <textarea name="example" value={formData.example || ''} onChange={handleInputChange} rows={2} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Thuộc Bài học</label>
                                        <select name="lessonId" value={typeof formData.lessonId === 'object' ? (formData.lessonId?._id || '') : (formData.lessonId || '')} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                            <option value="">-- Chọn bài học --</option>
                                            {allLessons.map(les => (
                                                <option key={les._id} value={les._id}>{les.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Thuộc Câu hỏi (Gợi ý câu hỏi - Tùy chọn)</label>
                                        <input type="text" name="questionId" value={formData.questionId || ''} onChange={handleInputChange} placeholder="Nhập ID câu hỏi nếu muốn gắn thẳng vào câu hỏi..." style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={handleCloseModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                    Hủy
                                </button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== MODAL 6: Xem chi tiết Bài học ===== */}
            {showLessonDetailModal && selectedLessonDetail && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '650px', maxWidth: '95%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>📖 Chi tiết Bài học</h2>
                            <button onClick={() => setShowLessonDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Tiêu đề</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{selectedLessonDetail.title}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Cấp độ</div>
                                <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '99px', backgroundColor: selectedLessonDetail.level === 'Cao' ? '#fee2e2' : selectedLessonDetail.level === 'Trung' ? '#fef3c7' : '#d1fae5', color: selectedLessonDetail.level === 'Cao' ? '#ef4444' : selectedLessonDetail.level === 'Trung' ? '#d97706' : '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedLessonDetail.level}</span>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Danh mục</div>
                                <div style={{ fontWeight: '600', marginTop: '0.4rem' }}>{selectedLessonDetail.categoryId?.name || 'Chưa phân loại'}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>XP Phần thưởng</div>
                                <div style={{ fontWeight: '800', color: '#7c3aed', fontSize: '1.2rem', marginTop: '0.25rem' }}>+{selectedLessonDetail.xpAwarded || 0} XP</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Số câu hỏi</div>
                                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.2rem', marginTop: '0.25rem' }}>{selectedLessonDetail.questions?.length ?? '—'} câu</div>
                            </div>
                        </div>
                        {selectedLessonDetail.description && (
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem' }}>Mô tả</div>
                                <div style={{ color: '#374151', lineHeight: 1.6 }}>{selectedLessonDetail.description}</div>
                            </div>
                        )}
                        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowLessonDetailModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL 7: Xem chi tiết Người dùng ===== */}
            {showUserDetailModal && selectedUserDetail && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '600px', maxWidth: '95%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>👤 Chi tiết Người dùng</h2>
                            <button onClick={() => setShowUserDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', flexShrink: 0 }}>
                                {selectedUserDetail.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedUserDetail.fullName}</div>
                                <div style={{ color: '#6b7280' }}>{selectedUserDetail.email}</div>
                                <span style={{ display: 'inline-block', marginTop: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: selectedUserDetail.role === 'admin' ? '#fee2e2' : '#f3f4f6', color: selectedUserDetail.role === 'admin' ? '#ef4444' : '#374151', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>{selectedUserDetail.role}</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Cấp độ</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.25rem', color: '#2563eb' }}>{selectedUserDetail.level}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>XP</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.25rem', color: '#059669' }}>{selectedUserDetail.xp}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Streak</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.25rem', color: '#ef4444' }}>{selectedUserDetail.streak || 0} 🔥</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Bài học đã hoàn thành ({selectedUserDetail.completedLessons?.length || 0})</div>
                            {selectedUserDetail.completedLessons?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    {selectedUserDetail.completedLessons.map((cl, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.9rem' }}>
                                            <span style={{ fontWeight: '500' }}>{cl.lesson?.title || 'Bài học'}</span>
                                            <span style={{ color: '#6b7280' }}>{new Date(cl.completedAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa hoàn thành bài học nào.</div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowUserDetailModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ===== MODAL 7.5: Xem chi tiết Góp ý ===== */}
            {showFeedbackDetailModal && selectedFeedbackDetail && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '600px', maxWidth: '95%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>💬 Chi tiết Góp ý</h2>
                            <button onClick={() => setShowFeedbackDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Người gửi</div>
                            <div style={{ fontWeight: 'bold' }}>{selectedFeedbackDetail.user?.fullName} ({selectedFeedbackDetail.user?.email})</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Loại góp ý</div>
                                <div style={{ fontWeight: '600', color: '#2563eb' }}>{selectedFeedbackDetail.type}</div>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Trạng thái</div>
                                <div style={{ fontWeight: '600' }}>{selectedFeedbackDetail.status}</div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Tiêu đề</div>
                            <div style={{ fontWeight: 'bold' }}>{selectedFeedbackDetail.title}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem' }}>Nội dung chi tiết</div>
                            <div style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedFeedbackDetail.content}</div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowFeedbackDetailModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL 8: Xác nhận Xóa ===== */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 70 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <div style={{ width: '70px', height: '70px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Trash2 size={32} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Xác nhận xóa</h3>
                        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                            Bạn có chắc muốn xóa <strong style={{ color: '#1f2937' }}>"{deleteTarget?.name || 'mục này'}"</strong>?<br />
                            <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Hành động này không thể hoàn tác.</span>
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer', flex: 1 }}>
                                Hủy
                            </button>
                            <button onClick={confirmDelete} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer', flex: 1 }}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default AdminDashboard;
