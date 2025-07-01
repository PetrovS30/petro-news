import  { createPortal } from 'react-dom';
import { useEffect, useState } from "react";
import SignInForm from './forms/SignInForm';
import SignUpForm from './forms/SignUpForm';
import './forms/register.scss';

interface FormModalProps {
  closeFormModal: () => void;
}

const FormModal = (props: FormModalProps) => {
  const [portal, setPortal] = useState(true);
  const [signUp, setSignUp] = useState(false);


  useEffect(() => {
    const body = document.body;
    if(portal) {
      body.style.overflow = 'hidden';
    }

    return () => {
      body.style.overflow = "";
    };
  }, [portal])

  const formSignActive = () => {
    setSignUp(true);
  }

  const formSignUpUnActive = () => {
    setSignUp(false);
  }

  const formClose = () => {
    setPortal(false);
    props.closeFormModal();
  }

  const classActive = signUp ? 'active' : '';

  const closeFormModal = () => {
    setPortal(false);
    props.closeFormModal();
  }

   return ( 
      <>
          {
          portal  ? <Portal>
            <div onClick={closeFormModal} className='modal-form-root-2'>
              <div className='modal-overlay'>
                <div className='modal-dialog' onClick={(e) => e.stopPropagation()}>
                  <div className={`modal-contant ${classActive}`}>
                    <SignInForm formSignActive={formSignActive} formClose={formClose}/>
                    <SignUpForm formSignUpUnActive={formSignUpUnActive} formClose={formClose}/>
                  </div>
                </div>
              </div>
            </div>
          </Portal> : null
          }
      </>
   )
}
export default FormModal;


const Portal = (props: { children: React.ReactNode }) => {
  // Используем состояние для хранения ссылки на корневой DOM-элемент портала.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element: HTMLElement | null = document.getElementById('modal-form-root');

    // Если элемент с ID 'modal-form-root' не найден, создаем его.
    if (!element) {
      element = document.createElement('div');
      element.setAttribute('id', 'modal-form-root'); 
      document.body.appendChild(element); 
    }
    // Сохраняем ссылку на элемент в состоянии, чтобы он был доступен для createPortal.
    setPortalRoot(element);

    // Функция очистки: будет вызвана при размонтировании компонента.
    return () => {
      // Проверяем, что элемент существует и что он был добавлен нами (или был пустым до нас).
      // Это предотвращает случайное удаление элемента, если он уже существовал в HTML изначально.
      if (element && element.parentNode === document.body && !element.hasChildNodes()) {
         // Удаляем элемент из body, если он пуст и был создан этим порталом.
        document.body.removeChild(element);
      }
    };
  }, []); 

  if (!portalRoot) {
    return null;
  }
  // Используем createPortal для рендеринга дочерних элементов
  return createPortal(props.children, portalRoot);
};




