import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import JsonToTS from 'json-to-ts';
import { UseJsonFormatter } from '../../composables/use-json-formatter';
import { formatJson } from '../../utils/json-utils';

vi.mock('json-to-ts', () => ({
  default: vi.fn()
}));

vi.mock('../../utils/json-utils', () => ({
  formatJson: vi.fn()
}));

function withSetup() {
  let result!: ReturnType<typeof UseJsonFormatter>;
  const Comp = defineComponent({
    setup() {
      result = UseJsonFormatter();
      return {};
    },
    template: '<div />'
  });

  const wrapper = mount(Comp);
  return { result, wrapper };
}

describe('UseJsonFormatter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockResolvedValue('  {"name":"alex"}  ')
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('handleFormat clears output when input is empty', () => {
    const { result } = withSetup();
    result.outputJson.value = 'old';
    result.inputJson.value = '   ';

    result.handleFormat();

    expect(result.outputJson.value).toBe('');
    expect(formatJson).not.toHaveBeenCalled();
  });

  it('handleFormat writes formatted output on success', () => {
    vi.mocked(formatJson).mockReturnValue({ result: '{\n  "a": 1\n}', error: null });
    const { result } = withSetup();
    result.inputJson.value = '{"a":1}';

    result.handleFormat();

    expect(result.outputJson.value).toBe('{\n  "a": 1\n}');
    expect(result.error.value).toBeNull();
  });

  it('handleFormat sets error when formatter fails', () => {
    const err = { message: 'bad json', line: 1, column: 2 };
    vi.mocked(formatJson).mockReturnValue({ result: null, error: err });
    const { result } = withSetup();
    result.inputJson.value = '{';

    result.handleFormat();

    expect(result.error.value).toEqual(err);
  });

  it('handleToTs converts formatted json to TS', () => {
    vi.mocked(formatJson).mockReturnValue({ result: '{"a":1}', error: null });
    vi.mocked(JsonToTS).mockReturnValue(['interface RootObject {', '  a: number;', '}']);
    const { result } = withSetup();
    result.inputJson.value = '{"a":1}';

    result.handleToTs();

    expect(result.outputJson.value).toContain('interface RootObject');
  });

  it('handleToTs sets formatter error and skips conversion', () => {
    const err = { message: 'format failed', line: 2, column: 1 };
    vi.mocked(formatJson).mockReturnValue({ result: null, error: err });
    const { result } = withSetup();
    result.inputJson.value = '{';

    result.handleToTs();

    expect(result.error.value).toEqual(err);
    expect(JsonToTS).not.toHaveBeenCalled();
  });

  it('handleToTs sets conversion error when formatted json is invalid', () => {
    vi.mocked(formatJson).mockReturnValue({ result: 'not-json', error: null });
    const { result } = withSetup();
    result.inputJson.value = '{"a":1}';

    result.handleToTs();

    expect(result.error.value?.message).toContain('Conversion failed:');
  });

  it('pasteInput sets trimmed clipboard text', async () => {
    const { result } = withSetup();

    await result.pasteInput();

    expect(result.inputJson.value).toBe('{"name":"alex"}');
  });

  it('pasteInput keeps input when clipboard read fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockRejectedValue(new Error('paste fail'))
      }
    });
    const { result } = withSetup();
    result.inputJson.value = 'keep-me';

    await result.pasteInput();

    expect(result.inputJson.value).toBe('keep-me');
  });

  it('pasteInput keeps input when clipboard text is empty', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockResolvedValue('   ')
      }
    });
    const { result } = withSetup();
    result.inputJson.value = 'keep-me';

    await result.pasteInput();

    expect(result.inputJson.value).toBe('keep-me');
  });

  it('handleMinify keeps original output when output is invalid json', () => {
    vi.mocked(formatJson).mockReturnValue({ result: 'not-json', error: null });
    const { result } = withSetup();
    result.inputJson.value = 'x';

    result.handleMinify();

    expect(result.outputJson.value).toBe('not-json');
  });

  it('handleClear resets input, output and error', () => {
    const { result } = withSetup();
    result.inputJson.value = '{"a":1}';
    result.outputJson.value = 'abc';
    result.error.value = { message: 'x', line: 1, column: 1 };

    result.handleClear();

    expect(result.inputJson.value).toBe('');
    expect(result.outputJson.value).toBe('');
    expect(result.error.value).toBeNull();
  });

  it('sets canPaste=true when used outside component and clipboard API exists', () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn()
      }
    });

    const result = UseJsonFormatter();

    expect(result.canPaste.value).toBe(true);
  });
});
