import { useState } from 'react';
import { register } from '../services/auth';

interface FormErrors {
    [key: string]: string;
}

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(
                formData.email,
                formData.nickname,
                formData.password
            );
            setMessage('Registration successful!');
            setErrors({});
        } catch (error) {
            if (error instanceof Error) {
                try {
                    const errorObj = JSON.parse(error.message);
                    setErrors(errorObj);
                } catch {
                    setErrors({ general: error.message });
                }
            }
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                </div>
                <div>
                    <label>Nickname:</label>
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                    />
                    {errors.nickname && <p style={{ color: 'red' }}>{errors.nickname}</p>}
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;