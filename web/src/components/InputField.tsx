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
