import CloseBurgerMenuBtn from '../ui/CloseFormBtn/CloseFormBtn';
import { UserLogo, PassLogo } from '../ui/LogoIcon/LogoIcon';
import { useState} from 'react';

import API_BASE_URL from '../../../../../config/api';

import './register.scss';

interface SignUpFormProps {
    formClose: (value: boolean) => void;
    formSignUpUnActive: (value: boolean) => void; 
}

const SignUpForm = (props: SignUpFormProps) => {
    const [firstName,setFirstName] = useState('');
    const [lastName,setLastName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');


   const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); 
        const formData = {
            firstName,
            lastName,
            email,
            password,
        };
        try {
            const res = await fetch(`${API_BASE_URL}api/signup`, {
                method: 'POST', 
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(formData), 
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Sign up successful:', data);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                props.formClose(false); 
            } else {
                const errorData = await res.json();
                console.error('Sign up failed:', errorData.message || 'Something went wrong');
                // Show an error message to the user
            }
        } catch (error) {
            console.error('Network error during sign up:', error);
        }
    };


    return (
        <div className='modal-contant-pages reg-page-sign-up second-form'>
            <div onClick={() => props.formClose(false)} className='modal-contant-pages-closebtn'>
                <CloseBurgerMenuBtn/>
            </div>
            <form style={{marginTop: 66, height: 360}} className='reg-page-form'>
                <div  style={{display: 'flex'}}>
                    <input 
                        className='reg-page-form-name-and-surname text-primary'  
                        type="text" 
                        placeholder='First Name'
                        autoComplete="username"
                        id='First Name'
                        name='username'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}/>
                              
                    <input 
                        style={{marginLeft:20}}
                        className='reg-page-form-name-and-surname ml-4'
                        type="text"
                        placeholder='Last Name'
                        autoComplete="Last Name"
                        id='Last Name'
                        name='lastName'
                        value={lastName} // Controlled component
                        onChange={(e) => setLastName(e.target.value)}/>
                </div> 
                <div className='input'>
                    <div className='reg-page-form-user-logo'>
                        <UserLogo/>
                    </div>
                    <input
                        type="email" 
                        placeholder='E-mail'
                        id="signUpEmail"
                        autoComplete='email'
                        name="email"
                        value={email} // Controlled component
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    <label htmlFor="signUpEmail"></label>
                </div>
                <div className='input'>
                    <div className='reg-page-form-pass-logo'>
                        <PassLogo/>
                    </div>
                    <input  
                        type="password"  
                        placeholder='Password' 
                        id="signUpPassword"
                        name="password" 
                        autoComplete='current-password'
                        value={password} // Controlled component
                        onChange={(e) => setPassword(e.target.value)}/>
                    <label htmlFor="signUpPassword"></label>
                </div>
                <div className='reg-page-form-sign-in'>
                    <button onClick={handleSubmit} className='reg-page-form-sign-in-btn'>Sign up</button>
                </div>
            </form>
            <div style={{marginTop: 10}} className='modal-contant-pages-signup'>
                <button onClick={() => props.formSignUpUnActive(false)}>Have an account? Sign in</button>
            </div>
        </div>
    )
}

export default SignUpForm;
