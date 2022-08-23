import styles from './footer.module.scss';

/* eslint-disable-next-line */
export interface FooterProps {}

export function Footer(props: FooterProps) {
  return (
    <footer className="static bottom-0 w-full h-10 bg-slate-600 text-slate-100 text-xs leading-10 text-center">
      <h1>This is the footer</h1>
    </footer>
  );
}

export default Footer;
