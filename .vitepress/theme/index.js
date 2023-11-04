import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue';
import Posts from './components/Posts.vue';
import Archives from './components/Archives.vue';
import Tags from './components/Tags.vue';
import './styles/vars.css';
import './styles/custom.css';

export default {
    extends: DefaultTheme,
    Layout: MyLayout,
    enhanceApp({app}) {
        // extend default theme custom behaviour.
        app.component('Posts', Posts);
        app.component('Archives', Archives);
        app.component('Tags', Tags);
    }
}