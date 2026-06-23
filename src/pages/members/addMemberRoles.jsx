import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { setAlert } from '../../redux/commonReducers/commonReducers';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { createSubUserType, getActionsBySubUserType, getSubUserTypes, updateSubUserType } from '../../service/subUserType/subUserTypeService';
import { connect } from 'react-redux';
import { getAllActions } from '../../service/actions/actionService';
import Button from '../../components/common/buttons/button';
import Checkbox from '../../components/common/checkBox/checkbox';
import Input from '../../components/common/input/input';
import CustomIcons from '../../components/common/icons/CustomIcons';

const AddMemberRoles = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [headers, setHeaders] = useState([]);

    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            rolesActions: {
                functionalities: []
            }
        },
    });

    const { fields: functionalities, replace } = useFieldArray({
        control,
        name: 'functionalities',
    });

    const handleCheckboxChange = (funcIndex, moduleIndex, actionId, checked) => {
        const functionalities = watch('functionalities');

        const updatedModules = functionalities[funcIndex].modules.map((module, index) => {
            if (index === moduleIndex) {
                const updatedActions = checked
                    ? [...module.roleAssignedActions, actionId]
                    : module.roleAssignedActions.filter((id) => id !== actionId);

                return {
                    ...module,
                    roleAssignedActions: updatedActions,
                };
            }
            return module;
        });

        const updatedFunctionalities = functionalities?.map((func, index) => {
            if (index === funcIndex) {
                return {
                    ...func,
                    modules: updatedModules,
                };
            }
            return func;
        });

        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAll = (checked) => {
        const updatedFunctionalities = watch('functionalities')?.map((func) => ({
            ...func,
            modules: func.modules.map((module) => ({
                ...module,
                roleAssignedActions: checked ? [...module.moduleAssignedActions] : [],
            })),
        }));

        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAllFunctionalitiesModules = (funcIndex, checked) => {
        const updatedFunctionalities = [...watch('functionalities')];

        const modules = updatedFunctionalities[funcIndex]?.modules || [];

        modules.forEach((module) => {
            if (checked) {
                module.roleAssignedActions = [...new Set([...module.moduleAssignedActions])];
            } else {
                module.roleAssignedActions = [];
            }
        });
        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAllModulesAction = (checked, actionId) => {
        const updatedFunctionalities = watch('functionalities').map((func) => ({
            ...func,
            modules: func.modules.map((module) => {
                const isActionAssignable = module.moduleAssignedActions.includes(actionId);
                return {
                    ...module,
                    roleAssignedActions: checked
                        ? isActionAssignable
                            ? [...new Set([...module.roleAssignedActions, actionId])] // Add actionId if assignable
                            : module.roleAssignedActions // No change if actionId is not assignable
                        : module.roleAssignedActions.filter((id) => id !== actionId), // Remove actionId if unchecked
                };
            }),
        }));

        setValue('functionalities', updatedFunctionalities);
    };

    const handleGetAllActions = async () => {
        const res = await getAllActions();
        if (res?.status === 200) {
            setHeaders(res?.result);
        }
    }

    const handleGetAllActionsByRole = async () => {
        if (id) {
            const res = await getSubUserTypes(id);
            setValue('name', res.data?.result?.name);
            replace(res.data?.result?.rolesActions?.functionalities);

        } else {
            const res = await getActionsBySubUserType(0);
            replace(res.data?.result?.functionalities);
        }
    }

    useEffect(() => {
        handleGetAllActions();
        handleGetAllActionsByRole();
    }, [id]);

    const handleSave = async (data) => {
        delete data.rolesActions
        if (id) {
            const newData = {
                name: data.name,
                id: id,
                rolesActions: {
                    functionalities: data.functionalities
                }
            }
            const res = await updateSubUserType(id, newData);
            if (res.data.status === 200) {
                navigate('/dashboard/members');
            } else {
                setAlert({ open: true, message: res.data.message, type: 'error' });

            }
        } else {
            const newData = {
                name: data.name,
                rolesActions: {
                    functionalities: data.functionalities
                }
            }
            const res = await createSubUserType(newData);
            if (res.data.status === 201) {
                navigate('/dashboard/members');
            } else {
                setAlert({ open: true, message: res.data.message, type: 'error' });
            }

        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className='md:w-96 mb-2'>
                    <Controller
                        name="name"
                        control={control}
                        rules={{
                            required: "Role Name is required",
                        }}
                        render={({ field }) => (
                            <Input
                                {...field}
                                fullWidth
                                id="name"
                                label="Role Name"
                                variant="outlined"
                                error={!!errors.name}
                            />
                        )}
                    />
                </div>
                <div className='overflow-x-auto'>
                    <table className="md:min-w-full rounded-lg bg-white border-collapse border border-gray-300">
                        <thead>
                            <tr className="border-b static top-0">
                                <th className="p-4 w-[30rem] text-left text-sm font-semibold">
                                    <div className='flex justify-start items-center'>
                                        <Checkbox
                                            checked={watch('functionalities')?.every((func) =>
                                                func.modules.every((module) =>
                                                    module.moduleAssignedActions.every((action) =>
                                                        module.roleAssignedActions.includes(action)
                                                    )
                                                )
                                            )}
                                            onChange={(e) => handleCheckAll(e.target.checked)}
                                        />
                                        <p>
                                            Functionality
                                        </p>
                                    </div>
                                </th>
                                <th className="p-4 w-44 text-left text-sm font-semibold">Module</th>
                                {headers?.map((header, index) => (
                                    <th key={index} className="p-4 text-sm font-semibold">
                                        <div>
                                            <p className='text-left mb-1'>{header?.name}</p>
                                            <Checkbox
                                                checked={watch('functionalities')?.every((func) =>
                                                    func.modules.every((module) =>
                                                        module.moduleAssignedActions.includes(header.id) &&
                                                        module.roleAssignedActions.includes(header.id))
                                                )}
                                                onChange={(e) => handleCheckAllModulesAction(e.target.checked, header.id)}
                                            />
                                        </div>
                                    </th>
                                ))}

                            </tr>
                        </thead>
                        <tbody>
                            {functionalities?.map((func, funcIndex) => (
                                <React.Fragment key={func.functionalityId}>
                                    <tr className="border-b">
                                        <td
                                            className="p-4 text-sm font-medium"
                                            rowSpan={func.modules?.length + 1}
                                        >
                                            <div className='flex justify-start items-center'>
                                                <Checkbox
                                                    checked={func.modules?.every((module) =>
                                                        module.moduleAssignedActions.every((action) =>
                                                            module.roleAssignedActions.includes(action)
                                                        )
                                                    )}
                                                    onChange={(e) => handleCheckAllFunctionalitiesModules(funcIndex, e.target.checked)}
                                                />
                                                <p>
                                                    {func.functionalityName}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    {func?.modules?.map((module, moduleIndex) => (
                                        <tr key={module.moduleId} className="border-b">
                                            <td className="p-4 text-sm">{module.moduleName}</td>
                                            {headers?.map((header, headerIndex) => {
                                                const isActionAvailable = module.moduleAssignedActions.includes(header.id);

                                                // Explicitly return the <td> element
                                                return (
                                                    <td key={headerIndex} className="p-4 text-center">
                                                        {isActionAvailable ? (
                                                            <Controller
                                                                name={`functionalities.${funcIndex}.modules.${moduleIndex}.roleAssignedActions`}
                                                                control={control}
                                                                render={() => (
                                                                    <Checkbox
                                                                        checked={module.roleAssignedActions.includes(header.id)}
                                                                        onChange={(e) =>
                                                                            handleCheckboxChange(
                                                                                funcIndex,
                                                                                moduleIndex,
                                                                                header.id,
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        ) : null }
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='flex justify-end my-3 gap-3'>
                    <div>
                        <Button type="submit" text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />}/>
                    </div>
                     <div>
                        <Button type="button" text={"Cancel"} variant="contained" useFor='disabled' onClick={() => navigate("/dashboard/members")} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </div>
            </form>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddMemberRoles)