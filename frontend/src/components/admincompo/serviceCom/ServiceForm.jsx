export const ServiceForm = ({ formData, onFormChange, onSubmit, onCancel, isEditing, categories, errors }) => {
 
    const handleDurationChange = (e) => {
        const value = e.target.value;
        if (value > 60) {
            onFormChange({
                ...formData,
                duration_minutes: value,
                durationError: "Maximum service duration is 60 minutes"
            });
        } else {
            onFormChange({
                ...formData,
                duration_minutes: value,
                durationError: ""
            });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {errors.global && (
                <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">
                    {errors.global}
                </div>
            )}

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Service Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter service name"
                />
                {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter service description"
                    rows="3"
                />
                {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium text-sm text-gray-700">
                        Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => onFormChange({ ...formData, price: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                    />
                    {errors.price && (
                        <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium text-sm text-gray-700">
                        Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={handleDurationChange}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="60"
                        max="60"
                    />
                    {errors.duration_minutes && (
                        <p className="text-xs text-red-500 mt-1">{errors.duration_minutes}</p>
                    )}
                    {formData.durationError && (
                        <p className="text-xs text-red-500 mt-1">{formData.durationError}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">
                    Service Image <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFormChange({ ...formData, image: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Image must be uploaded for this service
                </p>
                {errors.image && (
                    <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition"
                >
                    {isEditing ? 'Update Service' : 'Create Service'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md font-medium transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};