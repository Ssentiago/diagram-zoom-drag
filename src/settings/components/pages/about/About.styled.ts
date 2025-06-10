// About.styled.ts
import styled from 'styled-components';

export const FooterContent = styled.div`
    font-size: small;
    color: gray;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-top: 40px; /* отступ от кнопок */
    padding: 20px 0;
`;

export const Info = styled.div`
    margin-bottom: 12px;
    span {
        margin: 0 4px;
    }
`;

export const Slogan = styled.div`
    margin-bottom: 12px;
`;
