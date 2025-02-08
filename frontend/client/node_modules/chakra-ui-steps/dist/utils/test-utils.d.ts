import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import * as React from 'react';
/**
 * @vitest-environment jsdom
 */
declare type UI = Parameters<typeof rtlRender>[0];
declare function ChildrenPassthrough({ children }: {
    children: React.ReactElement;
}): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
/**
 * Custom render for @testing-library/react
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 * @param component the component under test
 * @param options customized test options
 */
export declare const render: (ui: UI, { wrapper: Wrapper, ...options }?: TestOptions) => RenderResult;
export { rtlRender };
export interface TestOptions extends Omit<RenderOptions, 'wrapper'> {
    /**
     * optional additional wrapper, e.g. Context
     *
     * @example
     * ```ts
     * // single wrapper
     * render(<MyConponent />, {
     *  wrapper: MyContext
     * });
     *
     * // multiple wrapper
     * render(<MyConponent />, {
     *  wrapper: ({ children }) => (
     *    <ContextA>
     *      <ContextB>
     *        {children}
     *      <ContextB />
     *    <ContextA />
     *  )
     * });
     *
     * ```
     */
    wrapper?: typeof ChildrenPassthrough;
}
