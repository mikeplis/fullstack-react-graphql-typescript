import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// Different from video because the latest version of Chakra has better types
type Props = { name: string; label: string } & (
    | ({
          textarea?: false; // making this optional so this is the default
      } & InputHTMLAttributes<HTMLInputElement>)
    | ({
          textarea: true;
      } & TextareaHTMLAttributes<HTMLTextAreaElement>)
);

export const InputField = (props: Props) => {
    const [field, { error }] = useField(props);
    let render;
    if (props.textarea) {
        const { textarea, ...rest } = props;
        render = <Textarea {...field} {...rest} id={field.name} />;
    } else {
        const { size, textarea, ...rest } = props;
        render = <Input {...field} {...rest} id={field.name} />;
    }

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            {render}
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

// // Different from video because the latest version of Chakra has better types
// type Props = { name: string; label: string } & (
//     | ({
//           textarea: false;
//       } & InputHTMLAttributes<HTMLInputElement>)
//     | ({
//           textarea: true;
//       } & TextareaHTMLAttributes<HTMLTextAreaElement>)
// );

// export const InputField = ({ textarea, ...props }: Props) => {
//     const [field, { error }] = useField(props);
//     let render;
//     if (textarea) {
//         // type narrowing isn't working as I expect, so I'm casting these for now
//         const _props = props as TextareaHTMLAttributes<HTMLTextAreaElement>
//         render = <Textarea {...field} {..._props} id={field.name} />;
//     } else {
//         const { size: _, ...rest } = props as InputHTMLAttributes<HTMLInputElement>;
//         render = <Input {...field} {...rest} id={field.name} />;
//     }

//     return (
//         <FormControl isInvalid={!!error}>
//             <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
//             {render}
//             {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
//         </FormControl>
//     );
// };

// type InputProps = InputHTMLAttributes<HTMLInputElement>;

// type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// type Props = { name: string; label: string; textarea: boolean } & (InputProps | TextareaProps);

// function isInput(textarea: boolean, props: InputProps | TextareaProps): props is InputProps {
//     return textarea === true;
// }

// export const InputField = ({ name, label, textarea, ...props }: Props) => {
//     const [field, { error }] = useField({ name, ...props });
//     let render;
//     if (isInput(textarea, props)) {
//         const { size: _, ...rest } = props;
//         render = <Input {...field} {...rest} id={field.name} />;
//     } else {
//         console.log(props);
//         render = <Textarea {...field} {...props} id={field.name} />;
//     }

//     return (
//         <FormControl isInvalid={!!error}>
//             <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
//             {render}
//             {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
//         </FormControl>
//     );
// };
