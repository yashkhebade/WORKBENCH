import { Avatar, AvatarImage, AvatarFallback } from './avatar';
export default { title: 'UI/Avatar', component: Avatar };
export const Default = () => <Avatar><AvatarImage src='https://github.com/shadcn.png' /><AvatarFallback>CN</AvatarFallback></Avatar>;